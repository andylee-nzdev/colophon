package nz.co.andy.colophon.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * CORS for the admin SPA.
 *
 * <p>Credentials are deliberately not allowed: the plan is a bearer token in an
 * {@code Authorization} header, not a cookie, so nothing here needs to relax
 * {@code SameSite}. When Spring Security is added it must opt in to this configuration
 * ({@code http.cors(withDefaults())}), or preflight requests will be rejected before
 * they reach the MVC layer.
 */
@Configuration
public class WebCorsConfig implements WebMvcConfigurer {

    private final CorsProperties properties;

    public WebCorsConfig(CorsProperties properties) {
        this.properties = properties;
    }

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins(properties.allowedOrigins().toArray(String[]::new))
                .allowedMethods("GET", "POST", "PUT", "DELETE")
                .allowedHeaders("Authorization", "Content-Type")
                .maxAge(3600);
    }
}
