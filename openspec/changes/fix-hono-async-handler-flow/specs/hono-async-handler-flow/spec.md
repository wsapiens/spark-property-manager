## ADDED Requirements

### Requirement: Express-compatible middleware progression
The Hono compatibility layer SHALL advance from one Express-style handler to the next only when the current handler explicitly calls `next()`.

#### Scenario: Resolved promise without next
- **WHEN** a handler returns a promise that resolves without a `Response` and does not call `next()`
- **THEN** the compatibility layer MUST NOT automatically invoke the next handler

#### Scenario: Explicit next
- **WHEN** a handler calls `next()`
- **THEN** the compatibility layer invokes the next handler in order

#### Scenario: Response returned from promise
- **WHEN** a handler returns a promise that resolves to a `Response`
- **THEN** the compatibility layer completes the request with that response

### Requirement: Async response finalization
Route handlers SHALL return or await asynchronous work that is responsible for sending the response.

#### Scenario: Async database read sends response
- **WHEN** a route reads from the database and sends the response in a promise callback
- **THEN** the route returns or awaits that promise before the request is considered complete

#### Scenario: Async database write sends response
- **WHEN** a route creates, updates, deletes, bulk creates, or runs a write query before sending a response
- **THEN** the route returns or awaits the database operation before finalizing the response

#### Scenario: Nested database write
- **WHEN** a route performs a nested database operation before sending a response
- **THEN** the nested operation is returned or awaited so failures and completion timing are observable

### Requirement: Router async audit
All migrated routers SHALL be audited so Sequelize promise chains are returned or converted to `async`/`await`.

#### Scenario: POST route audit
- **WHEN** a migrated POST route performs Sequelize work
- **THEN** its async operation is returned or awaited

#### Scenario: PUT route audit
- **WHEN** a migrated PUT route performs Sequelize work
- **THEN** its async operation is returned or awaited

#### Scenario: DELETE route audit
- **WHEN** a migrated DELETE route performs Sequelize work
- **THEN** its async operation is returned or awaited

#### Scenario: Missing return search
- **WHEN** the audit is complete
- **THEN** repository search does not show route handlers with unreturned Sequelize promise chains that send responses asynchronously
