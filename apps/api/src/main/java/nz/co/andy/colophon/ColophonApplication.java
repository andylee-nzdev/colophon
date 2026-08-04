package nz.co.andy.colophon;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class ColophonApplication {

    public static void main(String[] args) {
        SpringApplication.run(ColophonApplication.class, args);
    }

}
