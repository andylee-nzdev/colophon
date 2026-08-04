package nz.co.andy.colophon;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;

@SpringBootTest
@Import(TestcontainersConfiguration.class)
class ColophonApplicationTests {

    @Test
    void contextLoads() {
    }

}
