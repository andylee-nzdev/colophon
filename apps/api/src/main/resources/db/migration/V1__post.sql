-- Post: news / announcements. The first entity of the content model.
-- Every content entity carries `locale` from V1 so i18n never has to be retrofitted.
CREATE TABLE post (
    id           uuid         NOT NULL,
    locale       varchar(35)  NOT NULL DEFAULT 'en',
    slug         varchar(160) NOT NULL,
    title        varchar(200) NOT NULL,
    excerpt      varchar(500),
    body         text         NOT NULL,
    published    boolean      NOT NULL DEFAULT false,
    published_at timestamptz,
    created_at   timestamptz  NOT NULL DEFAULT now(),
    updated_at   timestamptz  NOT NULL DEFAULT now(),
    version      bigint       NOT NULL DEFAULT 0,

    CONSTRAINT post_pkey             PRIMARY KEY (id),
    -- Per-locale, not global: the same article translated into zh-Hant and en
    -- should share one slug rather than needing a locale suffix in the URL.
    CONSTRAINT post_locale_slug_key  UNIQUE (locale, slug),
    CONSTRAINT post_slug_format_chk  CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    CONSTRAINT post_published_at_chk CHECK (NOT published OR published_at IS NOT NULL)
);

-- Covers the public list query: WHERE locale = ? AND published ORDER BY published_at DESC
CREATE INDEX post_locale_published_at_idx ON post (locale, published, published_at DESC);

COMMENT ON TABLE  post              IS 'News / announcement entries.';
COMMENT ON COLUMN post.locale       IS 'BCP 47 language tag, e.g. en, zh-Hant, ja.';
COMMENT ON COLUMN post.published_at IS 'Set when published flips false -> true; never cleared on unpublish.';
