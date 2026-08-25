#!/usr/bin/env node
/**
 * Loads synthetic content into a colophon instance so the demo has something to build.
 *
 * Deliberately an HTTP client rather than a SQL script or a Flyway migration: seed data
 * is a property of one throwaway deployment, not of the schema, and every other CMS
 * instance would otherwise inherit it. Going through the API also exercises the same
 * validation an editor would hit.
 *
 * Re-running is safe. A slug that already exists comes back as 409 and is skipped, so
 * this never overwrites content someone edited by hand.
 *
 *   node scripts/seed.mjs                 # against http://localhost:8080
 *   COLOPHON_API_URL=... node scripts/seed.mjs
 */

import { fileURLToPath } from "node:url";

const API_URL = (process.env.COLOPHON_API_URL ?? "http://localhost:8080").replace(/\/+$/, "");
const ENDPOINT = `${API_URL}/api/v1/posts`;

/** @type {{locale: string, slug: string, title: string, excerpt: string, body: string, published?: boolean}[]} */
export const POSTS = [
    {
        locale: "en",
        slug: "hello-from-the-cms",
        title: "This page was written by a build, not a server",
        excerpt:
            "An introduction to the demo: what you are looking at, where the words came from, and what is deliberately not running.",
        body: `Everything you are reading was stored in a Postgres row, fetched over HTTP once,
and turned into a file. No part of that happens when you load the page.

## The short version

A headless CMS holds the content. A static site generator asks for it **at build time**
and writes HTML. A CDN serves the HTML. The chain from visitor to database is cut on
purpose, at the point where it would otherwise be a liability.

## Why bother

The usual arrangement — a site that queries its CMS per request — couples uptime to
uptime. If the CMS is slow, the site is slow. If the database connection pool is
exhausted, visitors see an error page. For a site that changes a few times a month,
that is a lot of exposure bought for very little freshness.

> Content is only as fresh as the last build. That is the entire trade, and for most
> content sites it is a bargain.

## What it costs

Publishing is no longer instant. An editor hits publish, a webhook fires, a build runs,
and a minute or two later the change is live. In exchange, the read path has no moving
parts left to break.`,
    },
    {
        locale: "en",
        slug: "what-the-api-returns",
        title: "One request, whole site",
        excerpt:
            "The list endpoint returns full post bodies rather than summaries. That single decision is what keeps a build from making N+1 requests.",
        body: `A content API for a static site generator has a different shape from one for a
browser. The browser wants small payloads and lazy loading. A build wants *everything*,
once.

## Summaries would be a mistake here

If \`GET /posts\` returned titles and excerpts only, a build with fifty posts would make
fifty-one requests — one list, then one per body. Every one of those is a round trip, a
connection, and another chance for the build to fail halfway.

So the list returns bodies:

\`\`\`http
GET /api/v1/posts?locale=en&size=200&sort=publishedAt,desc
\`\`\`

\`\`\`json
{
  "content": [
    {
      "slug": "what-the-api-returns",
      "title": "One request, whole site",
      "body": "A content API for a static site generator…",
      "published": true,
      "publishedAt": "2026-07-02T09:00:00Z"
    }
  ],
  "page": 0,
  "totalElements": 6,
  "last": true
}
\`\`\`

## The envelope

| Field | Why it is there |
| --- | --- |
| \`content\` | The posts themselves |
| \`page\`, \`size\` | Where in the sequence this is |
| \`totalElements\` | Lets an admin UI draw a pager |
| \`last\` | Lets a build loop until done without arithmetic |

That envelope is hand-written rather than Spring Data's \`Page\` serialised directly.
\`Page\`'s JSON shape is documented as unstable, and a static build depends on this
contract — it should not move when the framework does.

## Paging to exhaustion

The build does not assume one page is enough:

\`\`\`ts
for (let page = 0; ; page++) {
  const body = await fetchPage(page);
  posts.push(...body.content);
  if (body.last) break;
}
\`\`\`

Six posts fit in one page. Six hundred would not, and the loop is the difference between
a site that silently truncates and one that does not.`,
    },
    {
        locale: "en",
        slug: "drafts-are-invisible-by-construction",
        title: "Drafts are invisible by construction",
        excerpt:
            "There is no draft-hiding logic in this site. There is nothing to hide, because unpublished posts never leave the API.",
        body: `Somewhere in this CMS there is a post that is not published. You cannot reach it
from here, and the reason is worth stating plainly, because the usual reason is worse.

## The usual reason

Most sites fetch everything and filter in the template:

\`\`\`tsx
{posts.filter((p) => p.published).map(renderPost)}
\`\`\`

That works until someone writes a second listing page and forgets the filter. The draft
was in the payload the whole time; only a line of view code was keeping it out of sight.

## What happens instead

The API's list endpoint returns published content **by default**. Asking for anything
else is an explicit act:

\`\`\`http
GET /api/v1/posts                  # published only
GET /api/v1/posts?published=false  # drafts — will need a token
\`\`\`

The build never passes that parameter, so drafts are not in the response, not in the
route manifest, and have no page in \`out/\`. There is no URL to guess.

## And publishing is its own verb

\`published\` is not a field you \`PUT\`. It moves through \`POST /posts/{id}/publish\`,
which is also where the rebuild webhook will hang off later. Publishing is an event, not
an attribute — modelling it as one keeps the audit trail and the deploy trigger in the
same place.

The first publish sets \`publishedAt\`. Unpublishing leaves it alone, so a post that goes
back up keeps its original date rather than jumping to the top of the list.`,
    },
    {
        locale: "en",
        slug: "locale-from-day-one",
        title: "Why every row has a locale column",
        excerpt:
            "Nothing here is translated yet, and every content row still carries a language tag. Retrofitting that later is the expensive version.",
        body: `The first migration in this CMS creates one table, and that table has a \`locale\`
column that nothing was using at the time.

## The reasoning

Adding a column to an empty table is free. Adding one to a populated table means a
backfill, a uniqueness constraint that now has to consider language, every query
rewritten, and every URL reconsidered. The gap between those two costs is enormous, and
it opens on the day the first row is inserted.

## What it buys

Slugs are unique **per locale**, not globally:

\`\`\`sql
CONSTRAINT post_locale_slug_key UNIQUE (locale, slug)
\`\`\`

So an article and its translation share one slug instead of needing \`-en\` and \`-zh\`
suffixes bolted onto the URL. The index matches the query the public site actually makes:

\`\`\`sql
CREATE INDEX post_locale_published_at_idx
    ON post (locale, published, published_at DESC);
\`\`\`

## What it does not buy

A locale column is not internationalisation. There is no fallback chain, no way to ask
"this post in any language", no link between a post and its translation. Those are real
features and none of them are built.

What exists is the one part that would have been painful to add later. The rest can wait
until someone actually needs it.`,
    },
    {
        locale: "en",
        slug: "markdown-renders-once",
        title: "Markdown renders once, on a machine you will never meet",
        excerpt:
            "A tour of the formatting this site handles — and a note on where the parser runs, which is not in your browser.",
        body: `Editors write Markdown in the admin. Your browser never sees any of it. The parser
runs during the build, on a server component, and what ships is the HTML it produced.

## Why that matters

A Markdown renderer is not small. Shipping one to every visitor so it can re-derive the
same output every time is work done thousands of times that could be done once. On a
static site there is no reason to.

The framework's own runtime is still in this page — that is what makes navigation
between posts instant. The **parser** is not, and neither is the Markdown source.

## The formatting it handles

Emphasis comes in *italic*, **bold**, and \`inline code\`. Links [go
places](https://nextjs.org/docs/app/guides/static-exports). Lists nest:

- Fetch the content
  - Page until \`last\` is true
  - Fail loudly if the API is unreachable
- Render each post
- Write files

Ordered ones too:

1. Editor publishes
2. Webhook fires
3. Build runs
4. CDN updates

Tables work, via GitHub Flavored Markdown:

| Runs at | What | Cost of failure |
| --- | --- | --- |
| Build | Fetch, render, write | Build fails, old site stays up |
| Request | Serve a file | — |

Blockquotes:

> The public site must not depend on the CMS being up.

Code blocks keep their fences:

\`\`\`java
@GetMapping("/by-slug/{slug}")
public PostResponse getBySlug(@PathVariable String slug,
                              @RequestParam(required = false) String locale) {
    return service.getPublishedBySlug(locale, slug);
}
\`\`\`

---

And horizontal rules, apparently.

## What it does not handle

Raw HTML in a post body is printed as text, not parsed. The write endpoints are not
authenticated yet, which makes post bodies an untrusted source of markup — turning that
on would mean adding a sanitiser in the same commit.`,
    },
    {
        locale: "en",
        slug: "when-the-api-is-down",
        title: "What happens when the CMS is down",
        excerpt:
            "Two different outages with two different answers: one is invisible to visitors, and the other stops a build before it can publish an empty site.",
        body: `The API this site is built from runs on a free tier. Free tiers sleep, restart, and
occasionally vanish. That is fine, and it is worth being precise about why.

## Outage during a request

Nothing happens. There are no requests. A visitor is served a file by a CDN, and the CMS
is not in that path — it is not slow, it is not fast, it is simply not involved.

This is the property the whole arrangement exists to buy.

## Outage during a build

The build fails, on purpose.

\`\`\`
Error: Could not reach the colophon API at http://localhost:8080.
A static export needs it up at build time (the published site does not).
\`\`\`

The tempting alternative is to catch the error and carry on with whatever content is to
hand — usually none. That would replace a loud failure with a quiet one: a successful
deploy of a homepage with nothing on it, overwriting a site that was fine.

A failed build changes nothing. The previous deploy stays live, someone gets a
notification, and the site is still up while they look into it. The failure is *safe*,
which is a better property than not failing.

## The distinction the site does draw

An API that answers but has no published posts is not an outage — it is an empty CMS.
That gets an empty state, not an exception, because "nothing published yet" is a
legitimate thing for a new deployment to be.`,
    },
    {
        locale: "en",
        slug: "unpublished-editors-note",
        title: "Draft: notes for the next phase",
        excerpt: "This post is unpublished and should not be reachable from the demo site.",
        published: false,
        body: `If you are reading this on the demo site, something is wrong with the publication
filter — this post is seeded with \`published: false\` specifically so it can be checked.

It should be absent from the listing, absent from the route manifest, and 404 on a direct
visit to its slug.`,
    },
    {
        locale: "zh-Hant",
        slug: "hello-from-the-cms",
        title: "這一頁由建置產生，不是伺服器",
        excerpt: "與英文版共用同一個 slug——slug 只在同一語言內唯一，翻譯不需要在網址上加後綴。",
        body: `這篇文章與英文版 \`hello-from-the-cms\` 使用**相同的 slug**，兩者並存而不衝突。

## 為什麼可以

資料庫的唯一鍵是 \`(locale, slug)\`，不是 \`slug\`：

\`\`\`sql
CONSTRAINT post_locale_slug_key UNIQUE (locale, slug)
\`\`\`

同一篇文章的各種語言版本因此可以共用一個 slug，網址上不需要 \`-en\`、\`-zh\` 這類後綴。

## 這一頁在示範網站上看不到

示範網站每次建置只取一種語言（預設 \`en\`）。要看到這一頁，把 \`COLOPHON_LOCALE\`
設成 \`zh-Hant\` 再建置一次即可——同樣的程式碼，不同的網站。`,
    },
    {
        locale: "zh-Hant",
        slug: "locale-from-day-one",
        title: "為什麼每一列都有 locale 欄位",
        excerpt: "在還沒有任何翻譯的時候就加上語言欄位，是因為之後再補的代價高得多。",
        body: `這個 CMS 的第一個 migration 只建立了一張表，而那張表從一開始就有一個當時沒人使用的
\`locale\` 欄位。

## 理由

在空表上加欄位是免費的。在有資料的表上加，代表要回填資料、重新設計唯一性約束、改寫所有
查詢、重新考慮所有網址。這兩者的成本差距很大，而且從寫入第一列資料的那天就開始拉開。

## 但這不等於國際化

語言欄位不是國際化。沒有語言回退、沒有「任何語言中的這篇文章」查詢、沒有翻譯之間的關聯。
這些都是真正的功能，而且一個都還沒做。

已經完成的，只是之後補起來會很痛的那一部分。`,
    },
];

async function seed() {
    console.log(`Seeding ${POSTS.length} posts into ${ENDPOINT}\n`);

    let created = 0;
    let skipped = 0;

    for (const post of POSTS) {
        const label = `${post.locale}/${post.slug}`;
        let response;

        try {
            response = await fetch(ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                // `published` defaults to false server-side, so drafts need no special case.
                body: JSON.stringify({ published: true, ...post }),
            });
        } catch (cause) {
            console.error(`\nCould not reach the API at ${API_URL}.`);
            console.error("Start it with `./mvnw spring-boot:run` in apps/api, or set COLOPHON_API_URL.");
            console.error(`  ${cause.message}`);
            process.exit(1);
        }

        if (response.status === 409) {
            console.log(`  skip     ${label}  (slug already exists)`);
            skipped++;
            continue;
        }

        if (!response.ok) {
            const problem = await response.json().catch(() => ({}));
            console.error(`  FAILED   ${label}  ${response.status} ${problem.detail ?? response.statusText}`);
            for (const error of problem.errors ?? []) {
                console.error(`             ${error.field}: ${error.message}`);
            }
            process.exit(1);
        }

        console.log(`  created  ${label}${post.published === false ? "  (draft)" : ""}`);
        created++;
    }

    console.log(`\n${created} created, ${skipped} skipped.`);
    console.log("Next: `npm run build` — the export lands in out/.");
}

// Guarded so `POSTS` can be imported — by a test, or by a one-off fix-up script —
// without the import itself writing to whatever API happens to be configured.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
    await seed();
}
