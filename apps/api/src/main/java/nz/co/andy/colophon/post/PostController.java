package nz.co.andy.colophon.post;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.net.URI;
import java.util.UUID;
import nz.co.andy.colophon.common.web.PageResponse;
import nz.co.andy.colophon.post.dto.PostRequest;
import nz.co.andy.colophon.post.dto.PostResponse;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.http.HttpStatus;

/**
 * One resource path for posts. Reads are public; writes will require a token once
 * authentication lands, at which point the mutating methods below get a
 * {@code @PreAuthorize} and {@link #listForEditor} gets an authentication check.
 */
@Tag(name = "Posts", description = """
        News and announcements. Reads are public and return published content only; \
        write operations will require a bearer token in a later phase.""")
@RestController
@RequestMapping("/api/v1/posts")
public class PostController {

    private final PostService service;

    public PostController(PostService service) {
        this.service = service;
    }

    @Operation(summary = "List posts",
            description = """
                    Published content in one locale, newest first. Bodies are included so a \
                    static-site build can fetch everything it needs without a follow-up \
                    request per post.

                    Pass `published=false` to list drafts instead. Any value other than the \
                    default will require authentication in a later phase.""")
    @GetMapping
    public PageResponse<PostResponse> list(
            @RequestParam(required = false) String locale,
            @RequestParam(required = false) Boolean published,
            @PageableDefault(size = 20, sort = "publishedAt", direction = Sort.Direction.DESC)
            @ParameterObject Pageable pageable) {

        return service.list(locale, published, pageable);
    }

    /**
     * Slug lookups sit on their own path because a valid slug can structurally match a
     * UUID, which would make {@code /{id}} and {@code /{slug}} ambiguous.
     */
    @Operation(summary = "Get a published post by slug")
    @ApiResponse(responseCode = "200", description = "Found")
    @ApiResponse(responseCode = "404", description = "No published post with that slug in that locale",
            content = @io.swagger.v3.oas.annotations.media.Content)
    @GetMapping("/by-slug/{slug}")
    public PostResponse getBySlug(
            @PathVariable String slug,
            @RequestParam(required = false) String locale) {

        return service.getPublishedBySlug(locale, slug);
    }

    @Operation(summary = "Get any post by id, draft or published")
    @ApiResponse(responseCode = "200", description = "Found")
    @ApiResponse(responseCode = "404", description = "No post with that id",
            content = @io.swagger.v3.oas.annotations.media.Content)
    @GetMapping("/{id}")
    public PostResponse getById(@PathVariable UUID id) {
        return service.getById(id);
    }

    @Operation(summary = "Create a post",
            description = "Creates a draft unless `published` is true.")
    @ApiResponse(responseCode = "201", description = "Created")
    @ApiResponse(responseCode = "400", description = "Validation failed",
            content = @io.swagger.v3.oas.annotations.media.Content)
    @ApiResponse(responseCode = "409", description = "That slug is already used in that locale",
            content = @io.swagger.v3.oas.annotations.media.Content)
    @PostMapping
    public ResponseEntity<PostResponse> create(@Valid @RequestBody PostRequest request) {
        PostResponse created = service.create(request);
        return ResponseEntity
                .created(URI.create("/api/v1/posts/" + created.id()))
                .body(created);
    }

    @Operation(summary = "Replace a post",
            description = "Full replace. Publication state is changed via publish/unpublish.")
    @ApiResponse(responseCode = "200", description = "Updated")
    @ApiResponse(responseCode = "404", description = "No post with that id",
            content = @io.swagger.v3.oas.annotations.media.Content)
    @ApiResponse(responseCode = "409", description = "That slug is already used in that locale",
            content = @io.swagger.v3.oas.annotations.media.Content)
    @PutMapping("/{id}")
    public PostResponse update(@PathVariable UUID id, @Valid @RequestBody PostRequest request) {
        return service.update(id, request);
    }

    @Operation(summary = "Publish a post",
            description = "Sets `publishedAt` on first publish; later publishes keep the original date.")
    @PostMapping("/{id}/publish")
    public PostResponse publish(@PathVariable UUID id) {
        return service.publish(id);
    }

    @Operation(summary = "Unpublish a post",
            description = "Hides it from public reads. `publishedAt` is retained.")
    @PostMapping("/{id}/unpublish")
    public PostResponse unpublish(@PathVariable UUID id) {
        return service.unpublish(id);
    }

    @Operation(summary = "Delete a post")
    @ApiResponse(responseCode = "204", description = "Deleted")
    @ApiResponse(responseCode = "404", description = "No post with that id",
            content = @io.swagger.v3.oas.annotations.media.Content)
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable UUID id) {
        service.delete(id);
    }
}
