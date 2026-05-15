## ADDED Requirements

### Requirement: Database session persistence
The system SHALL persist session state in the existing `Sessions` database table using `sid`, `userId`, `expires`, `data`, `createdAt`, and `updatedAt` fields.

#### Scenario: New anonymous session is saved
- **WHEN** a request creates a new session
- **THEN** the system stores a `Sessions` row with a signed-cookie session id, serialized session data, expiry, and non-null timestamps

#### Scenario: Authenticated session is saved
- **WHEN** login succeeds
- **THEN** the system stores the authenticated user id in `Sessions.userId` and serialized session data

#### Scenario: Existing session is updated
- **WHEN** an existing valid session changes
- **THEN** the system updates the existing `Sessions` row without changing its session id

### Requirement: Session loading and expiry
The system SHALL load authenticated users only from valid signed-cookie sessions whose database record exists and has not expired.

#### Scenario: Valid session loads user
- **WHEN** a request includes a valid signed session cookie with an unexpired database record
- **THEN** the system loads the session data and exposes the authenticated user to route handlers

#### Scenario: Missing session record
- **WHEN** a request includes a signed session cookie whose database record does not exist
- **THEN** the system treats the request as unauthenticated

#### Scenario: Expired session record
- **WHEN** a request includes a signed session cookie whose database record has expired
- **THEN** the system treats the request as unauthenticated

#### Scenario: Invalid signed cookie
- **WHEN** a request includes a session cookie with an invalid signature
- **THEN** the system ignores that cookie and starts a new unauthenticated session

### Requirement: Logout destroys session
The system SHALL destroy the server-side database session and clear the client cookie when a user logs out.

#### Scenario: Logout deletes database row
- **WHEN** an authenticated user requests logout
- **THEN** the system deletes the current `Sessions` row from the database

#### Scenario: Logout clears cookie
- **WHEN** an authenticated user requests logout
- **THEN** the system sends a cookie-clearing response for the session cookie

#### Scenario: Destroyed session is not re-saved
- **WHEN** a request destroys its session
- **THEN** the session middleware MUST NOT recreate or upsert that same session at the end of the request

#### Scenario: Post-logout access denied
- **WHEN** a logged-out user reuses the old session cookie for a protected route
- **THEN** the system treats the request as unauthenticated

### Requirement: Session compatibility helpers
The system SHALL provide Express-compatible session helper behavior required by existing routes.

#### Scenario: Session destroy callback
- **WHEN** route code calls `req.session.destroy(callback)`
- **THEN** the system destroys the session and invokes the callback with no error on success

#### Scenario: Flash messages persist through database session
- **WHEN** a route writes a flash message and redirects
- **THEN** the message is stored in the database session and is available on the next request
