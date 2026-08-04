package nz.co.andy.colophon.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

/**
 * Enables the auditing listener that populates {@code createdAt} / {@code updatedAt}.
 *
 * <p>Kept as its own class rather than an annotation on the application class because
 * {@code @DataJpaTest} does not pick up arbitrary configuration — repository tests have
 * to {@code @Import} this explicitly, and a named class makes that dependency visible.
 */
@Configuration
@EnableJpaAuditing
public class JpaConfig {
}
