package nz.co.andy.colophon.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.bind.DefaultValue;

/**
 * @param defaultLocale applied when a request does not name a locale
 */
@ConfigurationProperties("colophon.content")
public record ContentProperties(@DefaultValue("en") String defaultLocale) {
}
