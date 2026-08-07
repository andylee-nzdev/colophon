package nz.co.andy.colophon.post.dto;

import java.time.Instant;
import java.util.UUID;

/**
 * A post in full, body included.
 *
 * <p>The public listing returns these rather than summaries on purpose: the consumer is a
 * static-site build, and summaries would turn one content fetch into 1 + N requests.
 */
public record PostResponse(
        UUID id,
        String slug,
        String locale,
        String title,
        String excerpt,
        String body,
        boolean published,
        Instant publishedAt,
        Instant createdAt,
        Instant updatedAt,
        long version) {
}
