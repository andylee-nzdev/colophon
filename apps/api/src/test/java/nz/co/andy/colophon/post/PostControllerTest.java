package nz.co.andy.colophon.post;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.BDDMockito.then;
import static org.mockito.BDDMockito.willThrow;

import java.time.Instant;
import java.util.List;
import java.util.UUID;
import nz.co.andy.colophon.common.error.ApiExceptionHandler;
import nz.co.andy.colophon.common.error.ResourceNotFoundException;
import nz.co.andy.colophon.common.error.SlugConflictException;
import nz.co.andy.colophon.common.web.PageResponse;
import nz.co.andy.colophon.post.dto.PostResponse;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.assertj.MockMvcTester;

/**
 * HTTP concerns only — status codes, JSON shape, validation and problem details.
 * Persistence is covered by {@link PostRepositoryTest}.
 */
@WebMvcTest(PostController.class)
@Import(ApiExceptionHandler.class)
class PostControllerTest {

    private static final UUID ID = UUID.fromString("0198a0e1-7b3c-7000-8000-000000000001");

    @Autowired
    private MockMvcTester mvc;

    @MockitoBean
    private PostService service;

    @Test
    void listReturnsAPagedEnvelope() {
        given(service.list(any(), any(), any(Pageable.class)))
                .willReturn(new PageResponse<>(List.of(sample()), 0, 20, 1, 1, true));

        assertThat(mvc.get().uri("/api/v1/posts").param("locale", "en"))
                .hasStatusOk()
                .bodyJson()
                .extractingPath("$.content[0].slug").isEqualTo("spring-festival");
    }

    @Test
    void getBySlugReturnsThePost() {
        given(service.getPublishedBySlug("en", "spring-festival")).willReturn(sample());

        assertThat(mvc.get().uri("/api/v1/posts/by-slug/spring-festival").param("locale", "en"))
                .hasStatusOk()
                .bodyJson()
                .extractingPath("$.body").isEqualTo("Full announcement text.");
    }

    @Test
    void getBySlugReturnsAProblemDetailWhenMissing() {
        given(service.getPublishedBySlug(any(), any()))
                .willThrow(ResourceNotFoundException.post("en", "nope"));

        assertThat(mvc.get().uri("/api/v1/posts/by-slug/nope"))
                .hasStatus(HttpStatus.NOT_FOUND)
                .hasContentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON)
                .bodyJson()
                .extractingPath("$.title").isEqualTo("Resource not found");
    }

    @Test
    void createReturns201WithALocationHeader() {
        given(service.create(any())).willReturn(sample());

        assertThat(mvc.post().uri("/api/v1/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"slug":"spring-festival","locale":"en","title":"Spring Festival",
                         "excerpt":"Join us.","body":"Full announcement text."}"""))
                .hasStatus(HttpStatus.CREATED)
                .hasHeader("Location", "/api/v1/posts/" + ID);
    }

    @Test
    void createRejectsABlankTitle() {
        assertThat(mvc.post().uri("/api/v1/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"slug":"ok-slug","title":"","body":"Body"}"""))
                .hasStatus(HttpStatus.BAD_REQUEST)
                .hasContentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON)
                .bodyJson()
                .extractingPath("$.errors[0].field").isEqualTo("title");
    }

    @Test
    void createRejectsASlugThatIsNotSlugShaped() {
        assertThat(mvc.post().uri("/api/v1/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"slug":"Not A Slug","title":"Title","body":"Body"}"""))
                .hasStatus(HttpStatus.BAD_REQUEST)
                .bodyJson()
                .extractingPath("$.errors[0].field").isEqualTo("slug");
    }

    @Test
    void createReturns409OnADuplicateSlug() {
        willThrow(new SlugConflictException("en", "spring-festival"))
                .given(service).create(any());

        assertThat(mvc.post().uri("/api/v1/posts")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"slug":"spring-festival","title":"Spring Festival","body":"Body"}"""))
                .hasStatus(HttpStatus.CONFLICT)
                .hasContentTypeCompatibleWith(MediaType.APPLICATION_PROBLEM_JSON)
                .bodyJson()
                .extractingPath("$.slug").isEqualTo("spring-festival");
    }

    @Test
    void getByIdReturns400WhenTheIdIsNotAUuid() {
        assertThat(mvc.get().uri("/api/v1/posts/not-a-uuid"))
                .hasStatus(HttpStatus.BAD_REQUEST);
    }

    @Test
    void deleteReturns204WithNoBody() {
        assertThat(mvc.delete().uri("/api/v1/posts/{id}", ID))
                .hasStatus(HttpStatus.NO_CONTENT)
                .body().isEmpty();

        then(service).should().delete(ID);
    }

    private static PostResponse sample() {
        Instant now = Instant.parse("2026-08-03T00:00:00Z");
        return new PostResponse(ID, "spring-festival", "en", "Spring Festival", "Join us.",
                "Full announcement text.", true, now, now, now, 0L);
    }
}
