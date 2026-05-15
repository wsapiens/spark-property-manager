## 1. Native Hono Foundation

- [x] 1.1 Audit all current route modules for `createRouter()`, `(req, res, next)` handlers, response helper usage, session/flash access, uploads, and Sequelize write operations.
- [x] 1.2 Add shared native Hono helper APIs for rendering EJS, current-user access, auth guards, sessions, flash messages, CSRF, request data, and uploads.
- [x] 1.3 Add route test helpers that can exercise native Hono routers and verify status codes, response bodies, redirects, rendered views, session persistence, and database side effects.
- [x] 1.4 Document the native route module pattern for new code, including direct `async (c) => {}` handlers, explicit `await`, and returned `Response` objects.

## 2. Low-Risk JSON Route Pilot

- [x] 2.1 Select one small JSON CRUD router, such as `routes/types.js` or `routes/payments.js`, as the first native Hono conversion slice.
- [x] 2.2 Convert the selected router from Express-compatible handlers to native Hono handlers while preserving existing paths, methods, statuses, and response shapes.
- [x] 2.3 Ensure every Sequelize read/write in the selected router is awaited before returning `c.json()`, `c.text()`, `c.redirect()`, or a rendered response.
- [x] 2.4 Add or update route tests for the selected router, including at least one write endpoint that proves the database side effect completes before response finalization.

## 3. Remaining JSON CRUD Routes

- [x] 3.1 Convert `routes/properties.js`, `routes/tenants.js`, `routes/units.js`, `routes/vendors.js`, `routes/users.js`, `routes/expenses.js`, and `routes/works.js` to native Hono handlers in small verifiable slices.
- [x] 3.2 Replace route-level `req.params`, `req.query`, `req.body`, `res.json()`, `res.send()`, `res.status()`, and `next()` usage with native Hono context helpers and direct returned responses.
- [x] 3.3 Await all create, update, destroy, bulkCreate, save, and raw write query operations in converted JSON routes.
- [x] 3.4 Add or update tests that preserve JSON response shapes, validation behavior, auth behavior, and database side effects for converted JSON routes.

## 4. Page, Auth, And Session Routes

- [x] 4.1 Convert `routes/manager.js` and other EJS-rendering routes to native Hono handlers using the shared render helper.
- [x] 4.2 Convert public, login, logout, and session-dependent routes in `routes/index.js` to native Hono handlers.
- [x] 4.3 Ensure logout destroys the backing session and returns the existing redirect behavior without relying on Express response finalization semantics.
- [x] 4.4 Add or update tests for rendered views, redirects, flash messages, login state, logout session destruction, and session persistence across native Hono handlers.

## 5. Upload And Import Routes

- [x] 5.1 Convert `routes/file.js` to native Hono handlers with explicit upload parsing and direct returned responses.
- [x] 5.2 Convert `routes/import.js` to native Hono handlers and await all file parsing, import, and database write operations before returning.
- [x] 5.3 Add or update tests for successful uploads/imports, invalid input handling, and database side effects.

## 6. Compatibility Wrapper Retirement

- [x] 6.1 Update `app.js` route mounting so converted native routers are mounted directly and compatibility routers only remain for unconverted modules.
- [x] 6.2 Search the repository to confirm no route module still depends on `createRouter()`, Express-style middleware signatures, or compatibility-only response/request shims.
- [x] 6.3 Remove obsolete compatibility wrapper code from `lib/hono-compat.js` once no routers require it.
- [x] 6.4 Remove or rewrite tests that only verify Express compatibility emulation, keeping tests that verify real route behavior.
- [x] 6.5 Run lint and the full test suite, then fix any regressions in routing, async database writes, sessions, rendering, uploads, or response shapes.
