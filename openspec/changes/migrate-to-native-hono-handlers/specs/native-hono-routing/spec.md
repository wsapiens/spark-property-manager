## ADDED Requirements

### Requirement: Native Hono route pattern
The system SHALL support route modules written as native Hono handlers that receive `c` and return Hono responses directly.

#### Scenario: Native JSON handler
- **WHEN** a native route handles a JSON endpoint
- **THEN** it awaits any required database work and returns `c.json()` with the existing response shape

#### Scenario: Native text handler
- **WHEN** a native route handles a text response endpoint
- **THEN** it returns `c.text()` with the existing status and body

#### Scenario: Native redirect handler
- **WHEN** a native route redirects a user
- **THEN** it returns `c.redirect()` with the existing location and status behavior

### Requirement: Native async database handling
Native Hono route handlers SHALL use explicit `await` for Sequelize operations before returning responses.

#### Scenario: Native read operation
- **WHEN** a native route reads from Sequelize before responding
- **THEN** the handler awaits the read before returning the response

#### Scenario: Native write operation
- **WHEN** a native route creates, updates, deletes, bulk creates, or runs a write query
- **THEN** the handler awaits the write before returning the response

#### Scenario: Native nested operation
- **WHEN** a native route performs nested database work
- **THEN** all nested work is awaited or flattened before the response is returned

### Requirement: Native shared helpers
The system SHALL provide shared native Hono helpers for behavior currently hidden behind Express-compatible request and response objects.

#### Scenario: Native authenticated route
- **WHEN** a native protected route requires an authenticated user
- **THEN** it uses a native Hono helper to access or require the current user

#### Scenario: Native rendered view
- **WHEN** a native route renders an EJS view
- **THEN** it uses a native Hono render helper and returns the rendered response

#### Scenario: Native flash message
- **WHEN** a native route reads or writes flash messages
- **THEN** it uses a native Hono session/flash helper backed by the existing database session state

### Requirement: Incremental compatibility retirement
The system SHALL allow native and compatibility routers to coexist during migration and SHALL remove compatibility emulation only after all routers are native.

#### Scenario: Mixed route mounting
- **WHEN** only some routers have been converted to native Hono
- **THEN** both native and compatibility routers continue to work under their existing route prefixes

#### Scenario: New route code
- **WHEN** new route code is added during the migration
- **THEN** it uses native Hono handlers instead of the Express compatibility wrapper

#### Scenario: Compatibility wrapper retirement
- **WHEN** no route modules depend on `createRouter()` or Express-style `(req, res, next)` handlers
- **THEN** the compatibility request/response emulation can be removed

### Requirement: Behavior preservation
Native Hono route conversions SHALL preserve existing URL paths, HTTP methods, response statuses, response shapes, redirects, rendered views, and database side effects.

#### Scenario: Converted JSON route preserves shape
- **WHEN** a JSON route is converted to native Hono
- **THEN** its response body shape remains compatible with the previous route

#### Scenario: Converted page route preserves rendering
- **WHEN** an EJS page route is converted to native Hono
- **THEN** it renders the same view with the same required locals

#### Scenario: Converted write route preserves side effects
- **WHEN** a write route is converted to native Hono
- **THEN** it performs the same database side effects before returning the response
