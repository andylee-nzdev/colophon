package nz.co.andy.colophon.post;

import java.time.Instant;
import java.util.UUID;
import nz.co.andy.colophon.common.error.ResourceNotFoundException;
import nz.co.andy.colophon.common.error.SlugConflictException;
import nz.co.andy.colophon.common.web.PageResponse;
import nz.co.andy.colophon.config.ContentProperties;
import nz.co.andy.colophon.post.dto.PostRequest;
import nz.co.andy.colophon.post.dto.PostResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

/**
 * The only transactional layer. Because {@code spring.jpa.open-in-view} is off, entities
 * are mapped to DTOs here, inside the transaction — nothing lazy escapes to the web layer.
 */
@Service
@Transactional(readOnly = true)
public class PostService {

    private final PostRepository repository;
    private final ContentProperties contentProperties;

    public PostService(PostRepository repository, ContentProperties contentProperties) {
        this.repository = repository;
        this.contentProperties = contentProperties;
    }

    /**
     * Defaults to published content only — what the public site and its build consume.
     * A caller asking for anything else is an editor, and will have to be authenticated
     * once that phase lands; this is the one place that check belongs.
     */
    public PageResponse<PostResponse> list(String locale, Boolean published, Pageable pageable) {
        String resolved = localeOrDefault(locale);
        Page<Post> page = published == null
                ? repository.findByLocaleAndPublishedIsTrue(resolved, pageable)
                : repository.findByLocaleAndPublished(resolved, published, pageable);
        return PageResponse.of(page, PostMapper::toResponse);
    }

    public PostResponse getPublishedBySlug(String locale, String slug) {
        String resolved = localeOrDefault(locale);
        return repository.findByLocaleAndSlugAndPublishedIsTrue(resolved, slug)
                .map(PostMapper::toResponse)
                .orElseThrow(() -> ResourceNotFoundException.post(resolved, slug));
    }

    public PostResponse getById(UUID id) {
        return PostMapper.toResponse(require(id));
    }

    @Transactional
    public PostResponse create(PostRequest request) {
        String locale = localeOrDefault(request.locale());
        if (repository.existsByLocaleAndSlug(locale, request.slug())) {
            throw new SlugConflictException(locale, request.slug());
        }

        Post post = new Post(
                locale, request.slug(), request.title(), request.excerpt(), request.body());
        if (Boolean.TRUE.equals(request.published())) {
            post.publish(Instant.now());
        }
        return PostMapper.toResponse(repository.save(post));
    }

    /** Full replace. Publication state is changed through {@link #publish} / {@link #unpublish}. */
    @Transactional
    public PostResponse update(UUID id, PostRequest request) {
        Post post = require(id);
        String locale = localeOrDefault(request.locale());

        if (repository.existsByLocaleAndSlugAndIdNot(locale, request.slug(), id)) {
            throw new SlugConflictException(locale, request.slug());
        }

        post.setLocale(locale);
        post.setSlug(request.slug());
        post.setTitle(request.title());
        post.setExcerpt(request.excerpt());
        post.setBody(request.body());
        return PostMapper.toResponse(post);
    }

    /**
     * Its own operation rather than a field on update, because this is the transition the
     * publish webhook will hang off later.
     */
    @Transactional
    public PostResponse publish(UUID id) {
        Post post = require(id);
        post.publish(Instant.now());
        return PostMapper.toResponse(post);
    }

    @Transactional
    public PostResponse unpublish(UUID id) {
        Post post = require(id);
        post.unpublish();
        return PostMapper.toResponse(post);
    }

    @Transactional
    public void delete(UUID id) {
        if (!repository.existsById(id)) {
            throw ResourceNotFoundException.post(id);
        }
        repository.deleteById(id);
    }

    private Post require(UUID id) {
        return repository.findById(id).orElseThrow(() -> ResourceNotFoundException.post(id));
    }

    private String localeOrDefault(String locale) {
        return StringUtils.hasText(locale) ? locale : contentProperties.defaultLocale();
    }
}
