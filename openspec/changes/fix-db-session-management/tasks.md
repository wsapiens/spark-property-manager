## 1. Session Store Persistence

- [x] 1.1 Update session save logic to write `sid`, `userId`, `expires`, `data`, `createdAt`, and `updatedAt`.
- [x] 1.2 Preserve `createdAt` when updating an existing session row.
- [x] 1.3 Ensure session data serialization includes auth, cookie, flash, and CSRF state.
- [x] 1.4 Ensure session cookie expiry and database `expires` remain aligned.

## 2. Session Loading

- [x] 2.1 Validate signed session id cookies before loading database records.
- [x] 2.2 Treat missing session records as unauthenticated requests.
- [x] 2.3 Treat expired session records as unauthenticated requests.
- [x] 2.4 Load authenticated users only from valid unexpired database sessions.

## 3. Logout Destruction

- [x] 3.1 Add a `destroy(callback)` function to the request session object.
- [x] 3.2 Delete the current `Sessions` row when a session is destroyed.
- [x] 3.3 Clear the session cookie with matching cookie options during session destruction.
- [x] 3.4 Prevent destroyed sessions from being re-saved by end-of-request middleware.
- [x] 3.5 Ensure `/logout` redirects after successful session destruction.

## 4. Verification

- [x] 4.1 Add tests proving successful login persists the session to the database with timestamps.
- [x] 4.2 Add tests proving flash messages persist through the database session.
- [x] 4.3 Add tests proving expired sessions do not authenticate.
- [x] 4.4 Add tests proving logout deletes the database session row and clears the cookie.
- [x] 4.5 Add tests proving an old cookie cannot access protected routes after logout.
- [x] 4.6 Run lint and the full test suite.
