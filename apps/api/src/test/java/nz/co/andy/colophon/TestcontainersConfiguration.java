package nz.co.andy.colophon;

import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.context.annotation.Bean;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;

/**
 * Supplies a real PostgreSQL for tests, so Flyway and {@code ddl-auto: validate} are
 * exercised against the same database the app runs on. Import it from any test that
 * needs a datasource.
 *
 * <p>The container is a bean rather than a static {@code @Container} field so it takes
 * part in Spring's context cache — one container is shared by every test class that
 * imports this configuration, instead of one per class.
 */
@TestConfiguration(proxyBeanMethods = false)
public class TestcontainersConfiguration {

    /** Same image as docker-compose.yml, so tests and local dev run the same Postgres major. */
    @Bean
    @ServiceConnection
    PostgreSQLContainer postgresContainer() {
        // Testcontainers 2.x: PostgreSQLContainer is no longer generic, and lives in
        // org.testcontainers.postgresql rather than org.testcontainers.containers.
        return new PostgreSQLContainer(DockerImageName.parse("postgres:18-alpine"));
    }
}
