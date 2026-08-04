package nz.co.andy.colophon.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    OpenAPI colophonOpenApi() {
        return new OpenAPI().info(new Info()
                .title("colophon API")
                .version("v1")
                .description("""
                        A headless CMS. Read endpoints are public and return published content \
                        only; they are consumed at build time by static sites, so listings \
                        include full bodies to avoid a request per item.

                        Write endpoints are unauthenticated for now and will require a bearer \
                        token in a later phase.

                        Errors are RFC 9457 problem details (`application/problem+json`).""")
                .license(new License().name("MIT")));
    }
}
