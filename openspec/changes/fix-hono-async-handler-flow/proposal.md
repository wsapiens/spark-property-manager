## Why

The Hono Express-compat wrapper currently calls `next()` automatically when a returned promise resolves without a `Response`, which differs from Express middleware semantics. Combined with existing routers that start Sequelize promise chains without returning or awaiting them, this can finalize requests before database create, update, or destroy operations complete.

## What Changes

- Change `runHandlers()` so resolved promises do not automatically advance to the next middleware unless the handler explicitly calls `next()`.
- Require async route handlers to return their promise chain or use `async`/`await` consistently.
- Audit all migrated routers for missing `return` statements around Sequelize promise chains.
- Ensure POST, PUT, DELETE, and other DB write endpoints await create, update, destroy, bulkCreate, and raw query operations before final response completion.
- Add tests that fail when a write route finalizes before its database operation or response callback completes.

## Capabilities

### New Capabilities
- `hono-async-handler-flow`: Defines Express-compatible async handler completion semantics for the Hono compatibility layer and route requirements for Sequelize async operations.

### Modified Capabilities

None.

## Impact

- Affected compatibility layer: `lib/hono-compat.js`.
- Affected routers: likely all files under `routes/`, especially POST, PUT, and DELETE handlers.
- Affected behavior: request completion timing, middleware sequencing, DB write consistency, and error propagation from async route work.
- Affected tests: add coverage for async write routes that return promise chains and for middleware that must not continue after a resolved promise unless `next()` is called.
