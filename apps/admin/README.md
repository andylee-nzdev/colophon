# apps/admin

The editor-facing admin SPA: React + [react-admin](https://marmelab.com/react-admin/)
over the colophon REST API, built with Vite.

React-admin generates the CRUD screens so the effort goes into the content model and the
API contract rather than into forms. If it ever becomes limiting, individual views can be
replaced piecemeal — the data provider stays.

## Running

The API must be up (`docker compose up -d` at the repo root, then `./mvnw spring-boot:run`
in `apps/api`).

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # type-check + production bundle into dist/
```

`VITE_API_URL` points at the API and defaults to `http://localhost:8080`. See
`.env.example`; real `.env*` files are gitignored.

## Layout

| File | Role |
|---|---|
| `src/dataProvider.ts` | The whole API translation layer — see below |
| `src/i18nProvider.ts` | UI language; Chinese by default, English fallback |
| `src/posts/` | List / create / edit views for `Post` |
| `src/App.tsx` | `<Admin>` and the resource registry |

## What the data provider reconciles

React-admin's conventions and this API's do not line up, and `dataProvider.ts` is the only
place that knows it:

- **Paging** — react-admin counts pages from 1, Spring's `Pageable` from 0, and the total
  comes back in the `PageResponse` body rather than a `Content-Range` header.
- **Sorting** — `{field, order}` becomes a single `sort=publishedAt,desc`. An unknown
  field returns a clean 400 rather than a 500, so a typo is visible.
- **Publishing is not a field.** `PUT /posts/{id}` ignores `published` on purpose; the
  transition belongs to `POST /posts/{id}/publish` because the deploy webhook will
  eventually hang off it. Hence the toolbar button instead of a checkbox, and hence the
  request body being narrowed to `PostRequest`'s fields before every write.
- **Errors** are RFC 9457 problem details. The `errors` array from bean validation is
  reshaped into `{field: message}` so react-admin can attach each message to the input
  that caused it; slug conflicts (409) surface as a notification.

## Known gaps

- **No auth.** The API's write endpoints are still open (Phase 2). When JWT lands, add an
  `authProvider` and an `Authorization` header in `dataProvider.ts`'s `request`.
- **The list cannot show drafts and published posts together.** `GET /posts` takes one
  locale and a tri-state `published` where "omitted" means published-only, so the list has
  an always-on draft/published toggle. The fix belongs on the API side, with auth: an
  authenticated editor omitting `published` should get everything.
- **`getMany` fans out** to one request per id — there is no bulk-by-ids endpoint. Fine
  while `Post` is the only resource and nothing references anything else.
- **No search.** There is no full-text endpoint, so no `q` filter.
- **UI chrome is 简体** (`ra-language-chinese`, a pre-v5 community package layered over
  the English messages so missing keys fall back rather than showing raw key names).
  Switching to 繁體 is a single import in `src/i18nProvider.ts`.
