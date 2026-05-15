## Why

Session state must be persisted and invalidated through the database-backed `Sessions` table so login state survives process restarts and logout reliably destroys server-side authentication state. The current Hono compatibility layer writes sessions to the database, but logout only clears fields in memory and still allows the middleware to save a replacement session record afterward.

## What Changes

- Use the existing `Sessions` table as the authoritative session store with columns `sid`, `userId`, `expires`, `data`, `createdAt`, and `updatedAt`.
- Ensure new and updated session rows include timestamp fields compatible with the migration-created table.
- Load sessions by signed session id cookie and ignore expired, missing, or invalid records.
- Save authenticated session state to the database after login with the authenticated user id and serialized session data.
- Destroy the database session row during logout and clear the session cookie so the same cookie cannot authenticate future requests.
- Prevent destroyed sessions from being re-saved by end-of-request middleware.
- Add tests for login persistence, expired session rejection, logout database deletion, cookie clearing, and post-logout access denial.

## Capabilities

### New Capabilities
- `db-session-management`: Defines database-backed session persistence, expiry handling, cookie lifecycle, authenticated user loading, and logout destruction behavior.

### Modified Capabilities

None.

## Impact

- Affected code: `lib/hono-compat.js`, `routes/index.js`, and Hono runtime/session tests.
- Affected data model: uses the existing `Sessions` Sequelize model/table; no new migration is required.
- Affected behavior: login, authenticated request loading, session expiry, logout, flash message persistence, and session cookie handling.
- Affected verification: tests must cover database upsert/delete behavior and prove logged-out cookies no longer authenticate.
