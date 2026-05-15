## Context

The app has been migrated from Express to Hono with a custom compatibility layer that lets existing route modules keep `(req, res, next)` handlers. That layer now owns request adaptation, response finalization, middleware progression, body parsing, EJS rendering, sessions, flash messages, uploads, static files, and error handling.

Recent fixes improved session persistence and async flow, but the wrapper still carries inherent risk because it attempts to reproduce Express semantics inside Hono. Native Hono handlers avoid this by making each handler explicitly receive `c`, await its own async work, and return a `Response`.

The migration should proceed incrementally so existing behavior remains stable while each route module is converted and verified.

## Goals / Non-Goals

**Goals:**

- Establish native Hono route handlers as the target pattern for all migrated route code.
- Convert route modules incrementally from `(req, res, next)` to `async (c) => {}`.
- Use direct Hono response APIs such as `c.json()`, `c.text()`, `c.redirect()`, and shared EJS rendering helpers.
- Use `await` for Sequelize reads/writes before returning responses.
- Share native Hono helpers for auth, sessions, flash messages, CSRF, request data, uploads, and rendering.
- Keep compatibility-wrapper routes operational until they are converted.
- Retire compatibility request/response emulation when all routes are native Hono.

**Non-Goals:**

- Change route URLs, HTTP methods, database schema, response shapes, or business workflows.
- Rewrite the UI or replace EJS.
- Replace Sequelize or session storage.
- Convert every route in a single high-risk step unless tests prove the slice is safe.

## Decisions

### Convert route modules in slices

Start with lower-risk JSON CRUD modules, then move to manager page rendering, public auth/session routes, and file upload/import routes. This limits blast radius and keeps failures easy to isolate.

Alternatives considered:

- Convert all routes in one pass. This is faster but high risk because the application has many route-specific DB and rendering behaviors.
- Keep improving the compatibility layer. This reduces short-term route churn but keeps the app dependent on emulated Express internals.

### Use a native Hono helper module

Shared behavior should move into native Hono helpers that accept `c`, not Express-style `req`/`res`. Helpers should cover:

- `renderView(c, view, locals, status?)`
- `requireUser(c)`
- `currentUser(c)`
- `getSession(c)`
- `flash(c, key, value?)`
- `csrfToken(c)`
- body/query/param access helpers where needed
- upload parsing helpers

Alternatives considered:

- Inline Hono APIs in every route. This is direct but duplicates session/auth/rendering details.
- Keep using compatibility helper functions. That delays wrapper retirement.

### Return responses directly

Native handlers must return Hono responses directly. Route code should not mutate a response object over time; instead it should await work and return `c.json()`, `c.text()`, `c.redirect()`, or rendered HTML.

Alternatives considered:

- Use mutable response shims. That recreates the same lifecycle complexity this change is intended to remove.

### Retire compatibility only after full route conversion

The compatibility layer can remain for unconverted routes. Once no route modules use `createRouter()` or `(req, res, next)`, remove wrapper-only request/response emulation and any tests that only cover emulation behavior.

## Risks / Trade-offs

- Mixed native and compatibility routers create two patterns → Track converted modules explicitly in tasks and keep new code native-only.
- Session/auth behavior diverges between patterns → Back native helpers with the same session middleware state and shared tests.
- Response shapes accidentally change → Add route-level tests before or during each route-module conversion.
- File upload route conversion is complex → Leave file/import routes for a later slice after JSON and page routes establish the pattern.
- Wrapper retirement too early → Remove compatibility code only when repository search proves no routes depend on it.

## Migration Plan

1. Add native Hono helper APIs that work directly with `c`.
2. Define a native route module template and test pattern.
3. Convert one low-risk JSON module first and verify behavior.
4. Convert remaining JSON CRUD modules in grouped slices.
5. Convert manager EJS page routes.
6. Convert public auth/session routes.
7. Convert file upload/import routes.
8. Remove compatibility wrapper usage from `app.js` and route modules.
9. Delete obsolete compatibility request/response emulation and wrapper-specific tests.

Rollback is per route module: keep compatibility routes until a native module passes tests, and revert only the affected module if behavior changes.

## Open Questions

- Which route module should be the first production slice: `types`, `payments`, or another small JSON-only module?
- Should native Hono helper files live under `lib/` beside `hono-compat.js`, or should route helpers be grouped under a new `routes/helpers/` directory?
