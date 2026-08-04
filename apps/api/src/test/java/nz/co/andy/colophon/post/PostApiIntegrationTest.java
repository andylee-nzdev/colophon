package nz.co.andy.colophon.post;

import java.util.UUID;
import nz.co.andy.colophon.TestcontainersConfiguration;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.context.annotation.Import;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.client.RestTestClient;

/**
 * The whole stack over real HTTP against real PostgreSQL: routing, validation, JPA,
 * Flyway's schema and the problem-detail handler all agreeing.
 *
 * <p>Deliberately narrow — validation and JSON shape are covered far more cheaply in
 * {@link PostControllerTest}. What only this level can prove is the publish transition
 * and the database's own uniqueness guarantee.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@Import(TestcontainersConfiguration.class)
class PostApiIntegrationTest {

    @LocalServerPort
    private int port;

    @Autowired
    private PostRepository repository;

    private RestTestClient client;

    @BeforeEach
    void setUp() {
        client = RestTestClient.bindToServer().baseUrl("http://localhost:" + port).build();
        repository.deleteAll();
    }

    @Test
    void createsADraftPublishesItAndServesItPublicly() {
        client.post().uri("/api/v1/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .body("""
                        {"slug":"spring-festival","locale":"en","title":"Spring Festival",
                         "excerpt":"Join us.","body":"Full announcement text."}""")
                .exchange()
                .expectStatus().isCreated()
                .expectHeader().exists(HttpHeaders.LOCATION)
                .expectBody()
                .jsonPath("$.published").isEqualTo(false)
                .jsonPath("$.publishedAt").doesNotExist();

        UUID id = repository.findAll().getFirst().getId();

        // A draft is indistinguishable from a post that does not exist.
        client.get().uri("/api/v1/posts/by-slug/spring-festival?locale=en")
                .exchange()
                .expectStatus().isNotFound();

        client.post().uri("/api/v1/posts/{id}/publish", id)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.published").isEqualTo(true)
                .jsonPath("$.publishedAt").exists();

        client.get().uri("/api/v1/posts/by-slug/spring-festival?locale=en")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.body").isEqualTo("Full announcement text.");

        // The call a static-site build makes.
        client.get().uri("/api/v1/posts?locale=en&size=200")
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                .jsonPath("$.totalElements").isEqualTo(1)
                .jsonPath("$.content[0].slug").isEqualTo("spring-festival");
    }

    @Test
    void unpublishingHidesThePostAgain() {
        UUID id = createPublished("spring-festival", "en");

        client.post().uri("/api/v1/posts/{id}/unpublish", id)
                .exchange()
                .expectStatus().isOk()
                .expectBody()
                // Retained, so re-publishing keeps the original date.
                .jsonPath("$.publishedAt").exists()
                .jsonPath("$.published").isEqualTo(false);

        client.get().uri("/api/v1/posts/by-slug/spring-festival?locale=en")
                .exchange()
                .expectStatus().isNotFound();
    }

    @Test
    void rejectsADuplicateSlugInTheSameLocale() {
        createPublished("spring-festival", "en");

        client.post().uri("/api/v1/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .body("""
                        {"slug":"spring-festival","locale":"en","title":"Duplicate","body":"Body"}""")
                .exchange()
                .expectStatus().isEqualTo(409)
                .expectHeader().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON)
                .expectBody()
                .jsonPath("$.slug").isEqualTo("spring-festival")
                .jsonPath("$.locale").isEqualTo("en");
    }

    @Test
    void acceptsTheSameSlugInAnotherLocale() {
        createPublished("spring-festival", "en");

        client.post().uri("/api/v1/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .body("""
                        {"slug":"spring-festival","locale":"zh-Hant","title":"新春法會","body":"全文"}""")
                .exchange()
                .expectStatus().isCreated();
    }

    @Test
    void appliesTheDefaultLocaleWhenTheRequestOmitsIt() {
        client.post().uri("/api/v1/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .body("""
                        {"slug":"no-locale-given","title":"Untagged","body":"Body"}""")
                .exchange()
                .expectStatus().isCreated()
                .expectBody()
                .jsonPath("$.locale").isEqualTo("en");
    }

    @Test
    void deletesAPostAndThenReturns404() {
        UUID id = createPublished("spring-festival", "en");

        client.delete().uri("/api/v1/posts/{id}", id)
                .exchange()
                .expectStatus().isNoContent();

        client.get().uri("/api/v1/posts/{id}", id)
                .exchange()
                .expectStatus().isNotFound()
                .expectHeader().contentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON);
    }

    private UUID createPublished(String slug, String locale) {
        client.post().uri("/api/v1/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .body("""
                        {"slug":"%s","locale":"%s","title":"Title","body":"Body","published":true}"""
                        .formatted(slug, locale))
                .exchange()
                .expectStatus().isCreated();

        return repository.findByLocaleAndSlugAndPublishedIsTrue(locale, slug).orElseThrow().getId();
    }
}
