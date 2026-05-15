## Why

The current Hono migration still depends on a custom Express compatibility layer that reimplements middleware chaining, response lifecycle handling, request helpers, session behavior, and async finalization semantics. Continuing to emulate Express internals creates avoidable race conditions and behavioral differences, especially around Sequelize writes, response completion, session persistence, and middleware execution.

Migrating routers incrementally to native Hono `async (c) => {}` handlers gives the application explicit async behavior, direct response returns, simpler middleware flow, and a path to retire the compatibility wrapper.

## What Changes

- Introduce native Hono route modules using `async (c) => {}` handlers instead of `(req, res, next)` compatibility handlers.
- Replace `req`/`res` helper usage with native Hono context helpers such as `c.req.param()`, `c.req.query()`, parsed body helpers, `c.json()`, `c.text()`, `c.redirect()`, and EJS render helpers.
- Use `await` directly for Sequelize read/write operations and return Hono responses from handlers.
- Convert routers incrementally, starting with lower-risk JSON CRUD modules before public auth/session and file upload routes.
- Keep compatibility-wrapper routes working during the migration, but prevent new route code from depending on the wrapper.
- Retire compatibility-layer request/response emulation once all routers are native Hono.

## Capabilities

### New Capabilities
- `native-hono-routing`: Defines route behavior, helper patterns, migration sequencing, and retirement criteria for replacing Express-compatible handlers with native Hono handlers.

### Modified Capabilities

None.

## Impact

- Affected code: `routes/*.js`, `app.js`, `lib/hono-compat.js`, shared Hono helper modules, and Hono runtime tests.
- Affected behavior: response lifecycle, async DB operation ordering, middleware execution, auth/session access, body parsing, redirects, JSON responses, EJS rendering, and uploads.
- Affected migration strategy: route modules must be converted and verified in slices so behavior remains stable while compatibility routes still exist.
- Affected tests: add route-level coverage proving native Hono routes preserve existing status codes, response shapes, redirects, rendered views, and DB side effects.
