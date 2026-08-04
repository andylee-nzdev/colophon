package nz.co.andy.colophon.common.error;

import java.net.URI;

/**
 * Stable {@code type} URIs for RFC 9457 problem responses. They need not resolve, but
 * clients branch on them, so they must not change once published.
 */
public final class ProblemTypes {

    private static final String BASE = "https://colophon.andy.co.nz/problems/";

    public static final URI RESOURCE_NOT_FOUND = URI.create(BASE + "resource-not-found");
    public static final URI VALIDATION_FAILED = URI.create(BASE + "validation-failed");
    public static final URI SLUG_CONFLICT = URI.create(BASE + "slug-conflict");
    public static final URI STALE_RESOURCE = URI.create(BASE + "stale-resource");
    public static final URI INVALID_PARAMETER = URI.create(BASE + "invalid-parameter");

    private ProblemTypes() {
    }
}
