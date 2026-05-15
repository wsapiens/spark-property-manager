## Context

The Hono migration uses `lib/hono-compat.js` to run existing Express-style `(req, res, next)` handlers. Its current `runHandlers()` implementation treats a resolved promise with no `Response` as a signal to call `next()`. Express does not do that: middleware continues only when `next()` is called, and route handlers that start asynchronous work are responsible for completing the response or propagating errors.

Many existing routers also start Sequelize promise chains without returning them. In Express, this often worked because `res.send()` eventually finalized the response while Express kept the socket open. In the Hono wrapper, unreturned async work can let the wrapper think the handler is done, causing premature empty responses or later responses that cannot be delivered.

This affects write-heavy routes across `routes/`: properties, units, users, tenants, expenses, imports, works, vendors, payments, files, and account routes.

## Goals / Non-Goals

**Goals:**

- Make the Hono compatibility layer follow Express middleware sequencing: only `next()` advances to the next handler.
- Avoid premature response finalization for async handlers that return promise chains.
- Audit routers so Sequelize read/write work is returned or awaited.
- Ensure create, update, destroy, bulkCreate, and raw query write operations complete before `res.send()`, `res.render()`, or redirects finalize the request.
- Add tests that catch premature completion and missing promise returns.

**Non-Goals:**

- Rewrite business logic or change endpoint behavior beyond async correctness.
- Convert every router to a new Hono-native style in this change.
- Change database schema or Sequelize models.
- Add new validation rules or authorization checks.

## Decisions

### Do not auto-call `next()` after promise resolution

`runHandlers()` must not infer middleware continuation from a resolved promise. A promise-returning handler that resolves without a `Response` should remain responsible for having sent the response; if it neither sends nor calls `next()`, the wrapper should not advance into later handlers automatically.

Alternatives considered:

- Keep auto-`next()` and only fix routers. This still leaves wrapper semantics different from Express and can break future handlers.
- Auto-send an empty response after any promise resolves. This hides missing responses and can finalize too early.

### Require route handlers to return or await async work

Route handlers that use Sequelize promise chains should return those chains. Where route logic is clearer with `async`/`await`, handlers can be converted to `async` functions, but the change should stay scoped to async correctness.

Alternatives considered:

- Build timer-based waiting into the wrapper for unreturned work. This is unreliable and masks bugs.
- Wrap Sequelize globally. That would be invasive and unrelated to HTTP handler semantics.

### Focus the audit on DB-backed route modules

The audit should cover every `routes/*.js` file with `.then()`, `create`, `update`, `destroy`, `bulkCreate`, or `sequelize.query` usage. Read endpoints also need returned promises because they send responses asynchronously, but write endpoints are the highest risk.

## Risks / Trade-offs

- Missed unreturned promise chain → Use repository search patterns and tests for representative route types.
- Nested promise chains still not awaited → Return nested operations or convert the handler to `async`/`await`.
- Routes that intentionally use multiple handlers stop progressing → Require explicit `next()` in those middleware handlers.
- Test stubs do not model timing → Add delayed promise tests to prove responses wait for DB operations.
- Large route churn → Keep edits mechanical and limited to returning/awaiting existing operations.

## Migration Plan

1. Update `runHandlers()` so resolved promises do not invoke `next()` automatically.
2. Add tests for wrapper sequencing and delayed async route completion.
3. Audit route modules for unreturned Sequelize chains.
4. Update read/write handlers to return promise chains or use `async`/`await`.
5. Ensure DB writes complete before response finalization.
6. Run lint and the full test suite.

## Open Questions

None.
