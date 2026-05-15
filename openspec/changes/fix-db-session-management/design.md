## Context

The Hono runtime compatibility layer currently owns session creation, cookie signing, database persistence, authenticated user loading, flash messages, and logout helpers. Sessions are intended to be stored in the existing Sequelize `Sessions` model backed by the migration-created table:

- `sid` string primary key
- `userId` string
- `expires` date
- `data` text
- `createdAt` date
- `updatedAt` date

The current implementation can upsert session data, but logout only clears in-memory auth fields and then calls `req.session.destroy()`, which is not implemented by the Hono session object. Even after logout clears fields, the end-of-request middleware can still save a session row and set a cookie. That makes logout semantics ambiguous and can leave stale session data in the database.

## Goals / Non-Goals

**Goals:**

- Treat the `Sessions` table as the authoritative session store.
- Persist session rows with the exact columns required by the existing migration, including timestamps.
- Load users only from valid, unexpired session records with a valid signed cookie.
- Destroy the database session row during logout.
- Clear the session cookie during logout.
- Prevent destroyed sessions from being re-saved after route handling.
- Keep flash messages and CSRF token storage compatible with database-backed sessions.
- Cover the behavior with focused tests.

**Non-Goals:**

- Introduce a new session table or migration.
- Replace the existing signed cookie name unless necessary.
- Change authentication credentials, password verification SQL, or user schema.
- Add distributed cache infrastructure.
- Redesign authorization or role behavior.

## Decisions

### Use the existing Sequelize `Sessions` model directly

The session middleware will continue to use `models.Sessions` rather than introducing a new external store package. This keeps behavior aligned with the existing table and avoids adding another session abstraction that may not match the migration shape.

Alternatives considered:

- Use a third-party Hono session package. This may not support the existing `Sessions` table columns or Sequelize model cleanly.
- Store all session data in signed cookies. This would change invalidation behavior and would not use the required database session store.

### Persist explicit timestamp fields on upsert

Every session save will write `sid`, `userId`, `expires`, `data`, `createdAt`, and `updatedAt`. If a row already exists, `createdAt` must preserve the original creation time when available and `updatedAt` must reflect the current save time.

Alternatives considered:

- Rely on Sequelize automatic timestamps. The `Sessions` model does not currently declare timestamp behavior explicitly, and the migration requires non-null timestamp columns.

### Add explicit session destruction semantics

The Hono request session object should expose a `destroy(callback)` function compatible with current route code. Calling it should mark the session as destroyed in request context, delete the database row by `sid`, clear authentication fields, clear the current user, and arrange for the response cookie to be cleared.

The end-of-request session middleware must check the destroyed marker and skip normal save/upsert for destroyed sessions.

Alternatives considered:

- Only delete auth fields and keep an anonymous session row. This leaves stale rows and does not satisfy logout destruction.
- Delete the row but let middleware recreate it. This makes logout look successful while still leaving a valid anonymous session cookie.

### Keep signed session id cookies

The cookie should continue to contain only the signed session id. Full session contents remain server-side in `Sessions.data`.

Alternatives considered:

- Store serialized session data in the cookie. This increases cookie size, exposes more data to clients, and weakens server-side invalidation.

## Risks / Trade-offs

- Timestamp mismatch with Sequelize model → Explicitly include `createdAt` and `updatedAt` in saved records and tests.
- Logout recreates sessions → Use a destroyed marker checked by the middleware before saving.
- Expired records still authenticate → Reject expired records during load and avoid setting `user` when the record is expired.
- Cookie clearing does not match cookie options → Clear the same cookie name/path/domain used by session creation.
- Flash messages lost unexpectedly → Preserve flash state in `data` until read, then save the consumed state.
- Existing tests use in-memory stubs → Extend stubs to support `destroy` and timestamp assertions.

## Migration Plan

1. Extend session middleware with explicit load, save, destroy, and cookie-clear behavior.
2. Add a `destroy(callback)` function to the request session object.
3. Update logout flow to rely on the implemented session destroy behavior.
4. Ensure session saves include `createdAt` and `updatedAt`.
5. Add tests for login persistence, expired session rejection, logout deletion, cookie clearing, and post-logout denied access.
6. Run lint and tests.

No database migration is required because the target `Sessions` table already exists.

## Open Questions

None.
