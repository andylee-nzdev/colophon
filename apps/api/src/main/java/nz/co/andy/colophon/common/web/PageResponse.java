package nz.co.andy.colophon.common.web;

import java.util.List;
import java.util.function.Function;
import org.springframework.data.domain.Page;

/**
 * The paged envelope the API returns.
 *
 * <p>Spring Data's {@code Page} is deliberately not serialized directly: its JSON shape
 * is documented as unstable, and this response is a contract a static-site build depends
 * on, so it should not move when Spring Data does.
 */
public record PageResponse<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean last) {

    public static <E, T> PageResponse<T> of(Page<E> page, Function<E, T> mapper) {
        return new PageResponse<>(
                page.getContent().stream().map(mapper).toList(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isLast());
    }
}
