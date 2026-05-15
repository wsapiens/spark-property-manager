## 1. Compatibility Layer Semantics

- [x] 1.1 Update `runHandlers()` so resolved promises do not automatically call `next()`.
- [x] 1.2 Preserve explicit `next()` behavior for multi-handler routes.
- [x] 1.3 Preserve support for handlers that return a `Response` or a promise resolving to a `Response`.
- [x] 1.4 Add tests for resolved promise without `next()`, explicit `next()`, and promise-returned `Response`.

## 2. Router Audit

- [x] 2.1 Audit all `routes/*.js` files for Sequelize `.then()` chains that are not returned.
- [x] 2.2 Update public account routes in `routes/index.js` to return or await async work.
- [x] 2.3 Update file upload/import routes in `routes/file.js` to return or await async work.
- [x] 2.4 Update property and unit routes to return or await async work.
- [x] 2.5 Update user, tenant, vendor, work, payment, import-config, expense, and type routes to return or await async work.

## 3. Write Operation Ordering

- [x] 3.1 Ensure create handlers wait for database create operations before sending responses.
- [x] 3.2 Ensure update handlers wait for database update operations before sending responses.
- [x] 3.3 Ensure delete handlers wait for database destroy operations before sending responses.
- [x] 3.4 Ensure nested write operations are returned or awaited before route completion.
- [x] 3.5 Ensure raw Sequelize queries that drive responses are returned or awaited.

## 4. Verification

- [x] 4.1 Add tests proving delayed DB write handlers do not finalize before write completion.
- [x] 4.2 Add tests proving explicit `next()` still advances middleware.
- [x] 4.3 Add tests proving a resolved promise without `next()` does not run later handlers.
- [x] 4.4 Run repository searches to confirm no obvious unreturned Sequelize promise chains remain in routes.
- [x] 4.5 Run lint and the full test suite.
