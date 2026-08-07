# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

`colophon` is a headless CMS, built from scratch as a learning project (Spring Boot)
with a real deployment target: a temple website (`yd-temple`, a separate private
Next.js repo) that will consume it as a deployed API. The public site is static —
content is fetched from this API at build time, not at request time, so the temple
site keeps working even if this API is down.

**Current state: bare scaffold.** Only `apps/api` has code, and it's just the
generated Spring Boot skeleton — no web layer, no persistence, no domain entities
yet. `apps/admin` and `apps/demo` are empty placeholder directories. `docs/` is
empty (no ADRs written yet).

If `local/project-plan.en.md` exists in your checkout, read it — it's the private
(gitignored) working doc with the full architecture, content model, phased
roadmap, and the reasoning behind every major decision (why Maven not Gradle, why
JWT not sessions, why instance-per-project not multi-tenant, etc.). It is not
tracked by git and won't exist in other clones or CI, but it's the fullest source
of truth for *why* the code is shaped the way it will be shaped. Decisions that
are meant to be public live in `docs/adr/` instead — check there too once it's
populated.

## Repo layout

This is a monorepo intended to hold three apps under `apps/`, plus `docs/`:

- `apps/api` — Spring Boot REST API. The only app with code so far.
- `apps/admin` — planned React admin SPA (React-Admin), not started.
- `apps/demo` — planned small Next.js consumer with synthetic seed data, not started.

Only `apps/api` is relevant to build/test/run commands right now.

## Commands (`apps/api`)

Run all commands from `apps/api` (the Maven wrapper lives there, not at repo root).

```bash
cd apps/api

./mvnw spring-boot:run       # run the app locally
./mvnw test                  # run all tests
./mvnw test -Dtest=ColophonApplicationTests            # run a single test class
./mvnw test -Dtest=ColophonApplicationTests#contextLoads  # run a single test method
./mvnw clean package          # build the jar (target/)
```

There is no root-level build file, Docker Compose file, or CI workflow yet.

## Architecture notes

- Package root: `nz.co.andy.colophon`.
- Java 21, Spring Boot **4.1.0**, Maven (wrapper pins Maven 3.9.16). Boot 4 is
  newer than most tutorial content in the wild, which is still written against
  Boot 3 — treat major-version mismatches as the first suspect when something
  documented doesn't behave as expected.
- Only `spring-boot-starter` and `spring-boot-starter-test` are on the classpath.
  Web (Spring MVC), persistence (Spring Data JPA + Postgres), migrations
  (Flyway — the intended approach is migrations only, never `ddl-auto`), auth
  (Spring Security + JWT), and API docs (springdoc-openapi) are all planned but
  not yet added — don't assume any of them are wired up without checking
  `pom.xml` first.
- `application.yaml` currently sets only `spring.application.name`.
