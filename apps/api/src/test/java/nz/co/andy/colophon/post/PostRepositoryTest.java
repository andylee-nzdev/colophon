package nz.co.andy.colophon.post;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatNoException;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import java.time.Instant;
import java.util.Optional;
import nz.co.andy.colophon.TestcontainersConfiguration;
import nz.co.andy.colophon.config.JpaConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.context.annotation.Import;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;

/**
 * Exercises the derived queries and the database constraints against real PostgreSQL.
 * Passing this also proves the Flyway schema and the entity mapping agree, since
 * {@code ddl-auto: validate} runs on context startup.
 */
@DataJpaTest
@Import({TestcontainersConfiguration.class, JpaConfig.class})
class PostRepositoryTest {

    @Autowired
    private PostRepository repository;

    @Test
    void assignsIdAndAuditTimestampsOnSave() {
        Post saved = repository.saveAndFlush(new Post("en", "hello", "Hello", null, "Body"));

        assertThat(saved.getId()).isNotNull();
        // Null here means @EnableJpaAuditing was not imported — the insert would then
        // violate the NOT NULL on created_at.
        assertThat(saved.getCreatedAt()).isNotNull();
        assertThat(saved.getUpdatedAt()).isNotNull();
        assertThat(saved.getVersion()).isZero();
    }

    @Test
    void allowsTheSameSlugInDifferentLocales() {
        repository.saveAndFlush(new Post("en", "festival", "Festival", null, "Body"));

        assertThatNoException().isThrownBy(() ->
                repository.saveAndFlush(new Post("zh-Hant", "festival", "法會", null, "全文")));
    }

    @Test
    void rejectsADuplicateSlugWithinOneLocale() {
        repository.saveAndFlush(new Post("en", "festival", "Festival", null, "Body"));

        assertThatThrownBy(() ->
                repository.saveAndFlush(new Post("en", "festival", "Duplicate", null, "Body")))
                .isInstanceOf(DataIntegrityViolationException.class);
    }

    @Test
    void publishedListingExcludesDraftsAndOtherLocales() {
        repository.saveAndFlush(published(new Post("en", "published-one", "One", null, "Body")));
        repository.saveAndFlush(new Post("en", "still-a-draft", "Draft", null, "Body"));
        repository.saveAndFlush(published(new Post("ja", "other-locale", "他の言語", null, "本文")));

        Page<Post> page = repository.findByLocaleAndPublishedIsTrue("en", PageRequest.of(0, 20));

        assertThat(page.getTotalElements()).isEqualTo(1);
        assertThat(page.getContent().getFirst().getSlug()).isEqualTo("published-one");
    }

    @Test
    void slugLookupIgnoresDrafts() {
        repository.saveAndFlush(new Post("en", "unannounced", "Unannounced", null, "Body"));

        assertThat(repository.findByLocaleAndSlugAndPublishedIsTrue("en", "unannounced")).isEmpty();
    }

    @Test
    void slugLookupFindsAPublishedPost() {
        repository.saveAndFlush(published(new Post("en", "announced", "Announced", null, "Body")));

        Optional<Post> found = repository.findByLocaleAndSlugAndPublishedIsTrue("en", "announced");

        assertThat(found).get().extracting(Post::getTitle).isEqualTo("Announced");
    }

    @Test
    void editorListingReachesDrafts() {
        repository.saveAndFlush(published(new Post("en", "published-one", "One", null, "Body")));
        repository.saveAndFlush(new Post("en", "still-a-draft", "Draft", null, "Body"));

        Page<Post> drafts = repository.findByLocaleAndPublished("en", false, PageRequest.of(0, 20));

        assertThat(drafts.getTotalElements()).isEqualTo(1);
        assertThat(drafts.getContent().getFirst().getSlug()).isEqualTo("still-a-draft");
    }

    @Test
    void slugExistenceCheckIsScopedToOneLocale() {
        Post saved = repository.saveAndFlush(new Post("en", "festival", "Festival", null, "Body"));

        assertThat(repository.existsByLocaleAndSlug("en", "festival")).isTrue();
        assertThat(repository.existsByLocaleAndSlug("ja", "festival")).isFalse();
        // A post never conflicts with itself when its own slug is resubmitted.
        assertThat(repository.existsByLocaleAndSlugAndIdNot("en", "festival", saved.getId())).isFalse();
    }

    private static Post published(Post post) {
        post.publish(Instant.now());
        return post;
    }
}
