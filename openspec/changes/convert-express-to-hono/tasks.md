## 1. Runtime Setup

- [x] 1.1 Add Hono and selected Hono-compatible middleware dependencies to `package.json`.
- [x] 1.2 Replace Express imports in `app.js` with a Hono app bootstrap.
- [x] 1.3 Adapt `bin/server.js` to serve the Hono app under the existing Bun start command, configured port, and HTTPS settings.
- [x] 1.4 Confirm `bin/cluster.js` still starts workers through the exported server start function.

## 2. Shared Hono Infrastructure

- [x] 2.1 Add shared response helpers for EJS rendering, redirects, text responses, JSON responses, status handling, and headers.
- [x] 2.2 Add shared request helpers for body fields, query values, route parameters, cookies, and request IP.
- [x] 2.3 Add Hono-compatible database-backed session middleware preserving current cookie settings and `Sessions` table storage.
- [x] 2.4 Add flash-message helpers backed by the Hono session layer.
- [x] 2.5 Add authentication helpers for login, logout, current-user loading, `isAuthenticated`, and `requireLogin`.
- [x] 2.6 Add CSRF token generation and validation helpers with the existing ignored route behavior.
- [x] 2.7 Add centralized not-found and error handling that logs errors and renders `views/error.ejs`.

## 3. Middleware Migration

- [x] 3.1 Replace request logging with Hono-compatible logging.
- [x] 3.2 Replace JSON and URL-encoded body parsing with Hono-compatible parsing.
- [x] 3.3 Replace cookie parsing/signing behavior with Hono-compatible cookie handling.
- [x] 3.4 Replace public static serving for `public` and required `node_modules` assets.
- [x] 3.5 Replace authenticated static serving for `/uploads`.
- [x] 3.6 Replace IP filtering behavior.
- [x] 3.7 Replace rate limiting behavior and apply it before route handlers.

## 4. Public Routes

- [x] 4.1 Convert `routes/index.js` to a Hono router.
- [x] 4.2 Preserve `GET /`, `GET /login`, `POST /login`, `GET /logout`, and password routes.
- [x] 4.3 Preserve `GET /subscribe` and `POST /subscribe` account creation behavior.
- [x] 4.4 Verify login failure flash messages and successful login session expiry behavior.

## 5. Manager Page Routes

- [x] 5.1 Convert `routes/manager.js` to a Hono router.
- [x] 5.2 Preserve all `/manager/*` EJS page routes and their template locals.
- [x] 5.3 Verify CSRF tokens are available to manager page templates.
- [x] 5.4 Verify anonymous `/manager/*` requests render the login page.

## 6. JSON CRUD Routes

- [x] 6.1 Convert `routes/types.js` to a Hono router and preserve JSON response shapes.
- [x] 6.2 Convert `routes/properties.js` to a Hono router and preserve property/unit side effects.
- [x] 6.3 Convert `routes/units.js` to a Hono router and preserve SQL query behavior.
- [x] 6.4 Convert `routes/users.js` to a Hono router and preserve account email behavior.
- [x] 6.5 Convert `routes/tenants.js` to a Hono router and preserve CRUD behavior.
- [x] 6.6 Convert `routes/expenses.js` to a Hono router and preserve date query and report response behavior.
- [x] 6.7 Convert `routes/import.js` to a Hono router and preserve import config behavior.
- [x] 6.8 Convert `routes/works.js` to a Hono router and preserve vendor creation side effects.
- [x] 6.9 Convert `routes/vendors.js` to a Hono router and preserve error responses.
- [x] 6.10 Convert `routes/payments.js` to a Hono router and preserve error responses.

## 7. File Upload Routes

- [x] 7.1 Convert `routes/file.js` to a Hono router without Multer middleware.
- [x] 7.2 Implement receipt multipart upload storage with the existing escaped company-prefixed filename pattern.
- [x] 7.3 Implement statement multipart upload storage and CSV import behavior.
- [x] 7.4 Preserve missing-file `400` responses for receipt and statement uploads.

## 8. Dependency Cleanup

- [x] 8.1 Remove Express imports from all application modules.
- [x] 8.2 Remove unused Express-only dependencies after the migration is complete.
- [x] 8.3 Update package keywords or documentation references that incorrectly describe the runtime as Express.
- [x] 8.4 Run a repository search to confirm no Express runtime usage remains.

## 9. Verification

- [x] 9.1 Add or update tests for anonymous login redirects and protected route behavior.
- [x] 9.2 Add or update tests for login success, login failure, session user loading, and logout.
- [x] 9.3 Add or update tests for representative authenticated JSON endpoints.
- [x] 9.4 Add or update tests for static assets and authenticated upload access.
- [x] 9.5 Add or update tests for receipt and statement uploads.
- [x] 9.6 Add or update tests for 404 and error rendering behavior.
- [x] 9.7 Run lint and the full test suite.
- [ ] 9.8 Smoke test `bun ./bin/server.js` against login, manager page rendering, one CRUD route, one upload route, static assets, and an unknown route.
