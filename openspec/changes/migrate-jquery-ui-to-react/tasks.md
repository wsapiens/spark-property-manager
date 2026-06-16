## 1. Foundation

- [x] 1.1 Add the React runtime and build pipeline needed to bundle page entry points.
- [x] 1.2 Add a React mount target to the shared layout so migrated pages can render into existing EJS routes.
- [x] 1.3 Add a small shared client helper for API requests and common date formatting.

## 2. Shared React UI

- [x] 2.1 Implement the shared React application shell for navigation, header, and page chrome.
- [x] 2.2 Implement reusable React components for collapsible sections and modal dialogs.
- [x] 2.3 Implement a shared React date input component and row-selection controls for table-based screens.
- [x] 2.4 Implement a reusable table wrapper for server-backed lists and bulk actions.

## 3. Page Migration

- [x] 3.1 Migrate the dashboard reporting page to React as the first end-to-end screen.
- [x] 3.2 Migrate one CRUD-heavy manager page, such as expenses or imports, to validate the shared widgets.
- [x] 3.3 Migrate the remaining manager pages using the shared React shell and components.

## 4. Cleanup and Validation

- [x] 4.1 Remove jQuery UI asset loading from migrated routes and templates.
- [x] 4.2 Remove unused legacy page scripts and DOM hooks after each route is cut over.
- [ ] 4.3 Verify the migrated workflows against the spec and confirm the rollback path for a single page.
