# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`colophon` is a headless CMS, built from scratch as a learning project (Spring Boot)
with a real deployment target: a temple website (`yd-temple`, a separate private
Next.js repo) that will consume it as a deployed API. The public site is static —
content is fetched from this API at build time, not at request time, so the temple
site keeps working even if this API is down.

**Current state.** `apps/api` has the `Post` entity end to end (web, JPA, Flyway,
springdoc, Testcontainers). `apps/admin` is a React-Admin SPA over it. `apps/demo`
is a statically exported Next.js site that consumes it. Auth is not built — every
endpoint is currently open, including the writes. `docs/` is empty (no ADRs
written yet).

If `local/project-plan.en.md` exists in your checkout, read it — it's the private
(gitignored) working doc with the full architecture, content model, phased
roadmap, and the reasoning behind every major decision (why Maven not Gradle, why
JWT not sessions, why instance-per-project not multi-tenant, etc.). It is not
tracked by git and won't exist in other clones or CI, but it's the fullest source
of truth for *why* the code is shaped the way it will be shaped. Decisions that
are meant to be public live in `docs/adr/` instead — check there too once it's
populated.

## Repo layout

A monorepo holding three apps under `apps/`, plus `docs/`:

- `apps/api` — Spring Boot REST API. The content contract the other two consume.
- `apps/admin` — React-Admin SPA (Vite). Writes content. Points at the API in the browser.
- `apps/demo` — Next.js static export. Reads content **at build time only**; the
  published output makes no request to the API.

Each app has its own build tooling and its own README; there is no root-level build
file. `docker-compose.yml` at the root runs Postgres and the admin dev server — the API
and the demo build are run from their own directories. There is no CI workflow yet.

## Commands

The Maven wrapper lives in `apps/api`, not at the repo root.

```bash
docker compose up -d db      # Postgres, required by the API

cd apps/api
./mvnw spring-boot:run       # run the app locally
./mvnw test                  # run all tests (Testcontainers spins up its own Postgres)
./mvnw test -Dtest=PostControllerTest             # a single test class
./mvnw test -Dtest=PostControllerTest#createRejectsABlankTitle  # a single test method
./mvnw clean package         # build the jar (target/)
```

```bash
cd apps/admin
npm run dev                  # Vite dev server on :5173 (the API's CORS default)
npm run build                # tsc -b && vite build
```

```bash
cd apps/demo
npm run seed                 # load synthetic posts into a running API — first run only
npm run build                # static export to out/; needs the API up
```

The demo's build is the one command that fails when the API is down. That is
deliberate — see `apps/demo/README.md`.

## Architecture notes

- Package root: `nz.co.andy.colophon`.
- Java 21, Spring Boot **4.1.0**, Maven (wrapper pins Maven 3.9.16). Boot 4 is
  newer than most tutorial content in the wild, which is still written against
  Boot 3 — treat major-version mismatches as the first suspect when something
  documented doesn't behave as expected.
- Wired up: Spring MVC, Spring Data JPA + Postgres, Flyway (migrations only —
  `ddl-auto` is set to `validate` and must stay that way), Bean Validation,
  springdoc-openapi, Testcontainers. **Not** wired up: Spring Security and JWT, so
  every endpoint including the writes is currently open. Check `pom.xml` before
  assuming anything else is present.
- Errors are RFC 9457 problem details; the paged envelope is the hand-written
  `PageResponse`, not Spring Data's `Page`, because a static build depends on that
  shape and it must not move when the framework does.
- The demo app (`apps/demo`) is the reference implementation of the build-time fetch
  pattern that `yd-temple` will copy. If the API's read contract changes — paging
  envelope, locale filtering, published-by-default — `apps/demo/src/lib/api.ts` is
  where that shows up first.
