# colophon demo

A statically exported Next.js site whose content comes from the colophon API — fetched
once, while the site is being built, and then never again.

It exists for two reasons: to be the public, runnable proof that the build-time fetch
pattern works before `yd-temple` depends on it, and to give the CMS something to point at
in a portfolio.

## The property being demonstrated

```
  build time                                    request time
  ──────────                                    ────────────
  next build ──HTTP──> colophon API ──> Postgres
       │
       └──> out/*.html ──> CDN ─────────────────> visitor
```

The visitor's arrow reaches the CDN and stops. No Node process, no database connection,
no API call. The CMS can be asleep on a free tier, mid-deploy, or broken, and the
published site does not notice — only the *next* publish is delayed.

## Running it

You need the API and its database up first; the build is not able to invent content.

```bash
docker compose up -d db          # from the repo root
cd apps/api && ./mvnw spring-boot:run
```

Then, in `apps/demo`:

```bash
npm install
npm run seed     # loads synthetic posts — first run only
npm run build    # static export lands in out/
npm start        # serve out/ at http://localhost:3000
```

`npm run dev` also works and is faster to iterate on, but it re-fetches per request, so
it is the one mode that does *not* demonstrate the point of the app.

## Configuration

| Variable | Default | Used by |
| --- | --- | --- |
| `COLOPHON_API_URL` | `http://localhost:8080` | the build and the seed script |
| `COLOPHON_LOCALE` | `en` | the build |

Neither is prefixed `NEXT_PUBLIC_`, so neither can reach the browser. Copy
`.env.example` to `.env.local` to override locally.

The API filters one locale per query, so a build produces a site in exactly one
language:

```bash
COLOPHON_LOCALE=zh-Hant npm run build
```

Same code, different site. The seed data includes two zh-Hant posts that share slugs
with their English counterparts, which works because the API's uniqueness constraint is
`(locale, slug)` rather than `slug`.

## How it is put together

| File | Does |
| --- | --- |
| `src/lib/api.ts` | The whole content layer: pages through `GET /api/v1/posts` until the API says `last`, memoised so one fetch feeds every page |
| `src/app/posts/[slug]/page.tsx` | `generateStaticParams` turns the fetched posts into routes — with `output: "export"` this is the only way those pages come to exist |
| `src/components/Markdown.tsx` | Renders post bodies during the build, so the parser never ships |
| `scripts/seed.mjs` | Loads synthetic content over HTTP; re-running skips slugs that exist |

Three decisions in there are worth knowing about, because each looks wrong until you hit
the failure it prevents:

**The fetch is uncached.** `cache: "force-cache"` is the obvious optimisation — it dedupes
across the worker processes Next forks — but that cache lives in `.next/cache` and
*survives between builds*, so rebuilding after a publish silently re-emits the previous
build's content. Being uncached costs a handful of requests per build and is the
difference between the publish pipeline working and appearing to.

**An unreachable API fails the build.** Catching the error and carrying on would turn a
loud failure into a quiet one: a successful deploy of an empty homepage, over a site that
was fine. A failed build changes nothing and leaves the previous deploy live. An API that
answers with *no published posts* is a different case, and gets an empty state rather than
an exception.

**Raw HTML in a post body is printed, not parsed.** The write endpoints are not
authenticated yet, so post bodies are not a trustworthy source of markup. Enabling
`rehype-raw` later would mean adding a sanitiser in the same commit.

## What it does not do

No images (the CMS has no `MediaAsset` yet), no search, no pagination in the UI, no
`Page`/`Event` content — `Post` is the only entity the API has. The About page is
hardcoded for that reason.

There is no publish webhook wired up here either. When that lands, it will trigger the
same `npm run build` this README describes; nothing in the app has to change for it.

All content served by this app is synthetic, written for the demo.
