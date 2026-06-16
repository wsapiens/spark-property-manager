## 1. Audit and table contract

- [x] 1.1 Inventory the manager and list screens that rely on the shared table path and confirm the current React table behaviors they need.
- [x] 1.2 Verify the React table contract covers row selection, select-all, custom cell rendering, and optional footer labels.

## 2. React table migration

- [x] 2.1 Update the shared React table component if any missing behavior is required to replace the legacy table dependency.
- [x] 2.2 Update the affected React pages and shared layout so they render through the native React table path instead of DataTables.
- [x] 2.3 Remove any remaining DataTables-specific assumptions from the table-related React components and page code.

## 3. Dependency cleanup

- [x] 3.1 Remove DataTables asset includes from the shared page head.
- [x] 3.2 Remove the DataTables packages from `package.json` and refresh the lockfile if the project tracks one.

## 4. Verification

- [x] 4.1 Run the front-end build and targeted tests to confirm the React table path still renders correctly.
- [x] 4.2 Search the codebase for remaining DataTables references and confirm the migrated screens no longer depend on them.
