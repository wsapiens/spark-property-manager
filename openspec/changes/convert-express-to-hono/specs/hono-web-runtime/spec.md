## ADDED Requirements

### Requirement: Hono application bootstrap
The system SHALL start the web application through a Hono-based runtime while preserving the existing configured port, HTTPS behavior, exported server start behavior, and mounted route prefixes.

#### Scenario: Start server with configured port
- **WHEN** the server is started through the existing start command
- **THEN** the Hono application listens on the configured application port

#### Scenario: Start server with HTTPS enabled
- **WHEN** HTTPS is enabled in application configuration
- **THEN** the server uses the configured key and certificate while serving the Hono application

#### Scenario: Mount existing route prefixes
- **WHEN** a request targets an existing route prefix such as `/manager`, `/expenses`, `/properties`, `/file`, or `/payments`
- **THEN** the request is routed through the corresponding Hono route module

### Requirement: Public page behavior
The system SHALL preserve the existing public page behavior for the home page, login page, logout route, password page, and subscription flow.

#### Scenario: Anonymous home page request
- **WHEN** an anonymous user requests `GET /`
- **THEN** the system renders the login page with the current flash error message

#### Scenario: Authenticated home page request
- **WHEN** an authenticated user requests `GET /`
- **THEN** the system renders the index page with the current user manager flag and package version

#### Scenario: Login page request
- **WHEN** any user requests `GET /login`
- **THEN** the system renders the login page and logs the request IP

#### Scenario: Logout request
- **WHEN** an authenticated user requests `GET /logout`
- **THEN** the system destroys the session and redirects the user to `/`

#### Scenario: Subscription request
- **WHEN** a user submits a valid subscription email
- **THEN** the system creates the company and login user records, sends the account email, and renders the existing subscription success message

### Requirement: Session-backed authentication
The system SHALL provide Hono-compatible session-backed authentication equivalent to the current local username and password login behavior.

#### Scenario: Successful login
- **WHEN** a user submits valid credentials to `POST /login`
- **THEN** the system stores the authenticated user id in the session, sets a one-hour session expiry, and redirects to `/` with status `301`

#### Scenario: Failed login
- **WHEN** a user submits invalid credentials to `POST /login`
- **THEN** the system redirects to `/login` and makes the login failure message available as a flash message

#### Scenario: Authenticated request user loading
- **WHEN** a request includes a valid authenticated session
- **THEN** the system loads the current user from the database and exposes the user to route handlers

#### Scenario: Unauthenticated protected request
- **WHEN** an anonymous user requests a protected page or data route
- **THEN** the system renders the login page with the existing empty message behavior

### Requirement: Server-rendered manager pages
The system SHALL preserve the existing manager page routes and EJS rendering behavior under `/manager`.

#### Scenario: Render manager page with CSRF token
- **WHEN** an authenticated user requests a manager page such as `GET /manager/expense`
- **THEN** the system renders the matching EJS view with title, manager flag, package version, and a CSRF token

#### Scenario: Anonymous manager page request
- **WHEN** an anonymous user requests any `/manager` page
- **THEN** the system renders the login page with the existing empty message behavior

### Requirement: JSON route compatibility
The system SHALL preserve the existing JSON route paths, HTTP methods, request data handling, database operations, and response shapes for properties, units, users, tenants, expenses, imports, works, vendors, payments, and types.

#### Scenario: Authenticated collection request
- **WHEN** an authenticated user requests an existing collection endpoint such as `GET /properties`
- **THEN** the system returns JSON with the same top-level shape currently used by that endpoint

#### Scenario: Authenticated entity request
- **WHEN** an authenticated user requests an existing entity endpoint such as `GET /properties/:propertyId`
- **THEN** the system returns JSON for the requested entity using the same route parameter semantics

#### Scenario: Authenticated create request
- **WHEN** an authenticated user submits form or JSON body data to an existing create endpoint
- **THEN** the system reads the submitted fields and performs the same database create behavior as before

#### Scenario: Authenticated update request
- **WHEN** an authenticated user submits form or JSON body data to an existing update endpoint
- **THEN** the system reads the submitted fields and performs the same database update behavior as before

#### Scenario: Authenticated delete request
- **WHEN** an authenticated user requests an existing delete endpoint
- **THEN** the system performs the same database delete behavior and response as before

### Requirement: Static assets and uploads
The system SHALL preserve the existing static asset serving behavior for public assets, selected `node_modules` assets, and authenticated uploads.

#### Scenario: Public static asset request
- **WHEN** a user requests an asset from the existing public static paths
- **THEN** the system serves the asset without requiring authentication

#### Scenario: Anonymous upload asset request
- **WHEN** an anonymous user requests an asset under `/uploads`
- **THEN** the system redirects or renders login according to the protected upload behavior

#### Scenario: Authenticated upload asset request
- **WHEN** an authenticated user requests an asset under `/uploads`
- **THEN** the system serves the asset from the existing uploads directory

### Requirement: File upload handling
The system SHALL preserve receipt and statement upload behavior under `/file` without relying on Express or Multer middleware.

#### Scenario: Receipt upload
- **WHEN** an authenticated user uploads a receipt file to `POST /file/receipt`
- **THEN** the system stores the file in the uploads directory using the existing company-prefixed escaped filename pattern and returns the stored filename

#### Scenario: Missing receipt upload
- **WHEN** an authenticated user submits `POST /file/receipt` without a receipt file
- **THEN** the system returns status `400` with `No files were uploaded.`

#### Scenario: Statement upload
- **WHEN** an authenticated user uploads a statement file to `POST /file/statement/:methodId`
- **THEN** the system stores the file, parses imported expenses using the existing import configuration, and returns the escaped original filename

#### Scenario: Missing statement upload
- **WHEN** an authenticated user submits `POST /file/statement/:methodId` without a statement file
- **THEN** the system returns status `400` with `No files were uploaded.`

### Requirement: Security middleware behavior
The system SHALL provide Hono-compatible CSRF protection, cookie handling, IP filtering, and rate limiting that preserves or intentionally corrects current security behavior.

#### Scenario: CSRF token available to rendered pages
- **WHEN** an authenticated user renders a protected manager page
- **THEN** the system exposes a CSRF token to the EJS view

#### Scenario: CSRF protected request
- **WHEN** a request requires CSRF validation and does not provide a valid token
- **THEN** the system rejects the request before executing the route handler

#### Scenario: IP filter check
- **WHEN** a request is received
- **THEN** the system evaluates the request IP against the configured IP filter behavior before protected route handling

#### Scenario: Rate-limited request
- **WHEN** a client exceeds the configured request limit within the configured window
- **THEN** the system returns a rate limit response and includes the configured standard rate limit headers

### Requirement: Error and not-found handling
The system SHALL preserve the existing not-found and error rendering behavior in the Hono runtime.

#### Scenario: Unknown route
- **WHEN** a request does not match any route or static asset
- **THEN** the system renders the error page with status `404`

#### Scenario: Route error
- **WHEN** a route handler throws or rejects with an error
- **THEN** the system logs the error message and stack and renders the error page with the appropriate status

#### Scenario: Development error detail
- **WHEN** the application runs in development mode and an error is rendered
- **THEN** the system makes error details available to the error view

#### Scenario: Production error detail
- **WHEN** the application does not run in development mode and an error is rendered
- **THEN** the system does not expose internal error details to the error view
