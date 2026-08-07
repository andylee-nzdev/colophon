package nz.co.andy.colophon.post;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PostRepository extends JpaRepository<Post, UUID> {

    /** The public listing: published content in one locale. */
    Page<Post> findByLocaleAndPublishedIsTrue(String locale, Pageable pageable);

    /** The site's per-post read. Drafts are invisible here by construction. */
    Optional<Post> findByLocaleAndSlugAndPublishedIsTrue(String locale, String slug);

    /** Editor listing — narrowed to one publication state, so drafts are reachable. */
    Page<Post> findByLocaleAndPublished(String locale, boolean published, Pageable pageable);

    boolean existsByLocaleAndSlug(String locale, String slug);

    /** Slug check for updates, where the post's own row must not count as a conflict. */
    boolean existsByLocaleAndSlugAndIdNot(String locale, String slug, UUID id);
}
