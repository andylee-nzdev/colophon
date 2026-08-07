package nz.co.andy.colophon.post.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Create and update payload. Update is a full replace, so one record serves both.
 */
public record PostRequest(
        @NotBlank
        @Size(max = 160)
        @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$",
                message = "must be lowercase alphanumeric words separated by single hyphens")
        String slug,

        /** Optional — the configured default locale is applied when absent. */
        @Size(max = 35)
        @Pattern(regexp = "^[A-Za-z]{2,8}(-[A-Za-z0-9]{2,8})*$",
                message = "must be a BCP 47 language tag, e.g. en or zh-Hant")
        String locale,

        @NotBlank
        @Size(max = 200)
        String title,

        @Size(max = 500)
        String excerpt,

        @NotBlank
        String body,

        /** Optional — absent means draft. */
        Boolean published) {
}
