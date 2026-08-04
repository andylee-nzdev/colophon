package nz.co.andy.colophon;

import org.springframework.boot.SpringApplication;

/**
 * Development entry point: runs the app against a throwaway PostgreSQL container,
 * so there is no need to start docker-compose first. Run this main instead of
 * {@link ColophonApplication} when working locally.
 */
public class TestColophonApplication {

    public static void main(String[] args) {
        SpringApplication.from(ColophonApplication::main)
                .with(TestcontainersConfiguration.class)
                .run(args);
    }
}
