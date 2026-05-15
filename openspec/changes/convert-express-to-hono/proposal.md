## Why

The application currently depends heavily on Express-specific middleware, routing, sessions, static serving, and request/response helpers throughout the server layer. This migration proceeds with Hono, but it must be treated as a planned rewrite of the HTTP runtime rather than a simple framework conversion because core behavior is tied to Express patterns including EJS rendering, Passport authentication, session middleware, flash messages, static serving, upload handling, and `express.Router()` modules.

Hono is being adopted only with explicit replacement designs for rendering, authentication, sessions, CSRF, uploads, static assets, rate limiting, IP filtering, and error handling.

## What Changes

- Replace the Express application bootstrap with a Hono application that can run from the existing Bun-based start command.
- Convert route modules from `express.Router()` handlers to Hono route modules while preserving the current URL paths, HTTP methods, redirects, rendered views, and JSON response shapes.
- Replace Express-specific middleware and patterns with Hono-compatible local equivalents for EJS rendering, Passport/local login, database-backed sessions, flash messages, CSRF, static serving, uploads, rate limiting, IP filtering, 404 handling, and error rendering.
- Preserve Sequelize models, database migrations, EJS templates, public assets, upload behavior, email integration, and existing configuration semantics.
- Remove Express-only runtime dependencies after all affected routes and middleware have been replaced and verified.

## Capabilities

### New Capabilities
- `hono-web-runtime`: Defines the Hono-based runtime contract for the existing server-rendered web application, including routing, middleware behavior, authentication/session compatibility, static assets, uploads, and error handling.

### Modified Capabilities

None.

## Impact

- Affected entry points: `app.js`, `bin/server.js`, `bin/www`, and `bin/cluster.js`.
- Affected route modules: all files under `routes/`.
- Affected dependencies: add Hono and selected replacements; remove Express-only packages once no application imports remain.
- Affected runtime behavior: HTTP request handling, EJS rendering, session persistence, Passport-style authentication replacement, flash messages, CSRF protection, static asset serving, upload parsing, rate limiting, IP filtering, and error rendering.
- Affected tests: route-level or integration coverage is required before replacing each Express route group, especially for login redirects, authenticated JSON endpoints, static/upload protection, and error handling.
