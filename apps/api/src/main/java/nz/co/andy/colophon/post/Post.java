package nz.co.andy.colophon.post;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EntityListeners;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Version;
import java.time.Instant;
import java.util.UUID;
import org.hibernate.annotations.UuidGenerator;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

/**
 * A news or announcement entry. Schema lives in {@code db/migration/V1__post.sql}.
 */
@Entity
@Table(name = "post")
@EntityListeners(AuditingEntityListener.class)
public class Post {

    /**
     * UUIDv7 rather than v4: it is time-ordered, so inserts stay local in the B-tree
     * instead of scattering writes the way random UUIDs do.
     */
    @Id
    @UuidGenerator(style = UuidGenerator.Style.VERSION_7)
    @Column(name = "id", nullable = false, updatable = false)
    private UUID id;

    /** BCP 47 tag. A String, not java.util.Locale, so it round-trips exactly as the consumer sends it. */
    @Column(name = "locale", nullable = false, length = 35)
    private String locale;

    @Column(name = "slug", nullable = false, length = 160)
    private String slug;

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "excerpt", length = 500)
    private String excerpt;

    @Column(name = "body", nullable = false, columnDefinition = "text")
    private String body;

    @Column(name = "published", nullable = false)
    private boolean published;

    @Column(name = "published_at")
    private Instant publishedAt;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Version
    @Column(name = "version", nullable = false)
    private long version;

    protected Post() {
        // for JPA
    }

    public Post(String locale, String slug, String title, String excerpt, String body) {
        this.locale = locale;
        this.slug = slug;
        this.title = title;
        this.excerpt = excerpt;
        this.body = body;
    }

    /**
     * Publishing is a domain operation rather than a setter, because {@code publishedAt}
     * records the first publish only — re-publishing does not reset it.
     */
    public void publish(Instant at) {
        if (!this.published) {
            this.published = true;
            if (this.publishedAt == null) {
                this.publishedAt = at;
            }
        }
    }

    /** Leaves {@code publishedAt} in place, so a re-publish keeps the original date. */
    public void unpublish() {
        this.published = false;
    }

    public UUID getId() {
        return id;
    }

    public String getLocale() {
        return locale;
    }

    public void setLocale(String locale) {
        this.locale = locale;
    }

    public String getSlug() {
        return slug;
    }

    public void setSlug(String slug) {
        this.slug = slug;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getExcerpt() {
        return excerpt;
    }

    public void setExcerpt(String excerpt) {
        this.excerpt = excerpt;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public boolean isPublished() {
        return published;
    }

    public Instant getPublishedAt() {
        return publishedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public long getVersion() {
        return version;
    }
}
