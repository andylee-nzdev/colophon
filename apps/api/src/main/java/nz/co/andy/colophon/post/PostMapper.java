package nz.co.andy.colophon.post;

import nz.co.andy.colophon.post.dto.PostResponse;

/**
 * Hand-written rather than generated: at this size a mapping library would cost more
 * build plumbing than it saves, and this is where per-role field visibility will go
 * once authentication lands.
 */
final class PostMapper {

    private PostMapper() {
    }

    static PostResponse toResponse(Post post) {
        return new PostResponse(
                post.getId(),
                post.getSlug(),
                post.getLocale(),
                post.getTitle(),
                post.getExcerpt(),
                post.getBody(),
                post.isPublished(),
                post.getPublishedAt(),
                post.getCreatedAt(),
                post.getUpdatedAt(),
                post.getVersion());
    }
}
