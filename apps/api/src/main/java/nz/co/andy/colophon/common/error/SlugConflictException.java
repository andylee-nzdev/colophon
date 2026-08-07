package nz.co.andy.colophon.common.error;

/** Maps to 409. Raised by the service's pre-check; the unique index is the real guarantee. */
public class SlugConflictException extends RuntimeException {

    private final transient String locale;
    private final transient String slug;

    public SlugConflictException(String locale, String slug) {
        super("A post with slug '%s' already exists for locale '%s'.".formatted(slug, locale));
        this.locale = locale;
        this.slug = slug;
    }

    public String getLocale() {
        return locale;
    }

    public String getSlug() {
        return slug;
    }
}
