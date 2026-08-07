package nz.co.andy.colophon.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * @param allowedOrigins origins permitted to call {@code /api/**} from a browser. The
 *                       admin SPA is a separate origin from the API by design — that
 *                       separation is the reason the auth decision landed on JWT rather
 *                       than cookie sessions — so it is always a cross-origin caller.
 *                       Static-site builds fetch server-side and are unaffected.
 */
@ConfigurationProperties("colophon.cors")
public record CorsProperties(
        @DefaultValue("http://localhost:5173") List<String> allowedOrigins) {
}
