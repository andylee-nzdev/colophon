package nz.co.andy.colophon.common.error;

import java.util.UUID;

/** Maps to 404. */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public static ResourceNotFoundException post(UUID id) {
        return new ResourceNotFoundException("No post with id '%s'.".formatted(id));
    }

    public static ResourceNotFoundException post(String locale, String slug) {
        return new ResourceNotFoundException(
                "No published post with slug '%s' for locale '%s'.".formatted(slug, locale));
    }
}
