## Context

The current server is an Express 4 application built around `app.js`, `bin/server.js`, and a set of route modules under `routes/`. It uses EJS templates, Sequelize, PostgreSQL-backed sessions through `connect-session-sequelize`, Passport local authentication, flash messages, `tiny-csrf`, `multer`, static file serving, IP filtering, and rate limiting.

Most route handlers rely on Express request and response helpers such as `req.body`, `req.params`, `req.query`, `req.user`, `req.session`, `req.flash()`, `req.isAuthenticated()`, `req.csrfToken()`, `res.render()`, `res.redirect()`, `res.status().send()`, and `res.setHeader()`. The migration must account for this helper surface, not only replace the top-level router.

The application already starts through Bun with `bun ./bin/server.js`, so Hono should be wired for the Bun runtime while preserving HTTP and HTTPS configuration from the existing server scripts.

## Goals / Non-Goals

**Goals:**

- Replace Express routing and middleware with Hono routing and Hono-compatible middleware.
- Preserve the current public URL paths, HTTP methods, rendered EJS pages, redirect behavior, JSON response shapes, file upload behavior, static asset paths, and session-backed login behavior.
- Keep Sequelize models, migrations, views, public assets, email behavior, and configuration keys unchanged unless a direct framework migration requires a narrow adjustment.
- Centralize common Hono helpers for rendering, authentication checks, session access, flash messages, CSRF token access, body parsing, and error handling so individual routes remain readable.
- Add enough integration coverage to detect regressions in unauthenticated redirects, successful login flow, authenticated JSON routes, uploads, static files, 404s, and error rendering.

**Non-Goals:**

- Redesigning the UI, view templates, database schema, authorization model, or business workflows.
- Replacing Sequelize, PostgreSQL, EJS, or email delivery.
- Introducing an API versioning redesign or changing JSON response contracts.
- Changing from server-rendered pages to a client-side application.

## Decisions

### Use Hono as the application router and Bun request handler

The new `app.js` should export a Hono app or a request handler that `bin/server.js` can serve with Bun. The server scripts should continue to derive port and HTTPS settings from the existing config. If Node `http.createServer(app)` cannot directly consume the Hono app in the target runtime, the server script should adapt via Hono's runtime-specific handler instead of keeping an Express compatibility layer.

Alternatives considered:

- Keep Express and mount Hono under it. This reduces immediate migration risk but does not satisfy the framework conversion and leaves the middleware stack Express-bound.
- Rewrite server scripts completely around a new runtime model. This creates unnecessary operational churn because the existing config, cluster script, and start command are otherwise serviceable.

### Convert route modules to Hono route modules

Each `routes/*.js` module should export a Hono router with equivalent route paths. `app.js` should mount those routers at the same prefixes currently used by Express, such as `/manager`, `/expenses`, `/properties`, `/file`, and `/payments`.

Alternatives considered:

- Build an Express-like adapter that lets existing `(req, res, next)` handlers run unchanged. This would preserve code initially but hides framework differences, complicates async error behavior, and delays the actual migration work.
- Collapse routes into `app.js`. This makes the migration harder to review and maintain.

### Introduce a small request-context compatibility layer

Hono uses `Context` instead of Express `req` and `res` objects. Add local helpers for common behavior:

- `render(c, view, locals, status?)` for EJS rendering.
- `redirect(c, location, status?)` for redirects.
- `jsonData(c, payload)` and `text(c, body, status?)` for common responses.
- `getBody(c)`, `getQuery(c)`, and `getParam(c, name)` for request data.
- `getSession(c)`, `getUser(c)`, `isAuthenticated(c)`, and `requireLogin(c)` for auth/session access.
- `flash(c, key, value?)` for one-time messages.
- `csrfToken(c)` and CSRF verification helpers.

This keeps route conversion explicit without scattering low-level Hono API calls across every business handler.

Alternatives considered:

- Rename every route handler variable to use `c` and inline Hono calls everywhere. This is direct but increases churn and makes behavior harder to audit.
- Emulate the full Express request/response API. This recreates Express semantics poorly and risks long-term maintenance burden.

### Replace Passport session behavior with an equivalent local authentication flow

Passport is Express-oriented. The migrated app should preserve the current local login behavior by moving the SQL password verification, user serialization, user lookup, session storage, and logout behavior into local Hono-compatible auth middleware/helpers.

The session payload should continue storing the authenticated user id and should load the current user from `models.User.findByPk()` for authenticated requests. Login failure must continue redirecting to `/login` with the existing flash message behavior.

Alternatives considered:

- Adapt Passport to Hono through compatibility middleware. This may work with enough shims but keeps the most security-sensitive path coupled to Express assumptions.
- Replace authentication with a new provider. That is out of scope and would change product behavior.

### Keep database-backed sessions and cookie semantics

The current app stores sessions in the `Sessions` table and configures secure, httpOnly, domain, and expiry options based on app config. The Hono migration should preserve those semantics, either by using a Hono-compatible session implementation backed by Sequelize/PostgreSQL or by implementing a narrow session middleware backed by the existing `Sessions` model/table.

Alternatives considered:

- Switch to stateless signed cookies. This simplifies infrastructure but changes session invalidation and storage semantics.
- Use in-memory sessions. This would break clustered/multi-process behavior.

### Replace middleware package-by-package

Express-only middleware should be replaced with Hono-compatible behavior:

- `morgan` logging: Hono logger or local logging middleware with equivalent request visibility.
- `express.json()` and `express.urlencoded()`: Hono/body parsing helpers.
- `cookie-parser`: Hono cookie helpers with the configured secret where signing is required.
- `tiny-csrf`: Hono-compatible CSRF middleware or a local implementation preserving current token exposure and ignored routes.
- `express.static`: Hono static file serving for `public`, `node_modules`, and authenticated `/uploads`.
- `express-ipfilter`: local IP filter middleware, initially matching the current empty block list behavior.
- `express-rate-limit`: Hono-compatible rate limiter or local rate limiter applied before routes.
- `multer`: Hono multipart parsing plus controlled filesystem writes for receipt and statement uploads.

Alternatives considered:

- Use Express middleware adapters for most packages. This would be faster initially but keeps runtime behavior dependent on Express middleware contracts.

## Risks / Trade-offs

- Authentication/session regression → Add focused tests for login success, login failure, logout, unauthenticated redirects, and user loading from the session.
- CSRF regression → Verify token generation in manager pages and rejection/allow behavior for protected and ignored routes.
- Upload regression → Test receipt and statement multipart uploads, generated filenames, missing-file errors, and authenticated `/uploads` access.
- Static asset regression → Verify `public` and expected `node_modules` assets still resolve under existing paths.
- Error handling drift → Preserve 404 rendering and logged 500 rendering with development-only error detail.
- Runtime mismatch between Hono adapters and Bun/Node server scripts → Confirm the final app boots under `bun ./bin/server.js` and cluster mode still invokes the correct exported server function.
- Large route conversion churn → Convert routes in groups and keep each route module mounted at the same prefix to simplify review and testing.

## Migration Plan

1. Add Hono dependencies and any selected Hono-compatible middleware packages.
2. Introduce shared Hono helpers for rendering, auth/session, CSRF, body parsing, flash messages, responses, and errors.
3. Convert `app.js` bootstrap and server startup to create and serve the Hono app.
4. Convert public routes (`/`, `/login`, `/logout`, `/subscribe`) and validate login/session behavior.
5. Convert manager page routes and verify EJS rendering with CSRF tokens.
6. Convert JSON CRUD routes module-by-module while preserving response shapes.
7. Convert file upload routes and authenticated upload static serving.
8. Replace IP filtering and rate limiting in the Hono middleware stack.
9. Remove Express-only dependencies when no imports remain.
10. Run lint/tests and perform smoke checks for unauthenticated pages, login, representative CRUD endpoints, uploads, static assets, 404, and error rendering.

Rollback is straightforward before dependency removal: keep the Express implementation available in version control and revert the framework migration if smoke checks fail. After dependency removal, rollback requires restoring Express dependencies and the previous route modules from version control.

## Open Questions

- Which Hono session package, if any, is acceptable for database-backed sessions, or should the project implement a narrow local Sequelize-backed session middleware?
- Should the migrated app preserve the current `/uploads` static behavior exactly, including filesystem path and access gating, or tighten it as part of a separate future security change?
- Should the current rate limiter placement be corrected during migration? In the existing `app.js`, it is registered after routes and error handlers, which likely prevents it from applying to normal requests.
