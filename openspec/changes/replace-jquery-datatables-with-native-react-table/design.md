## Context

The shared page head still loads jQuery DataTables assets through `views/head.ejs`, and `package.json` still carries DataTables dependencies even though the React UI already owns the active manager list experience. The current React codebase has a native table primitive in `src/ui/components/SelectableTable.jsx` and shared CRUD layouts in `src/ui/components/ManagerPage.jsx`, so the replacement is mostly a consolidation and cleanup of an existing direction rather than a greenfield grid build.

The migration needs to preserve existing manager workflows, including multi-select actions, editable list rows, and server-backed data loading. The app should keep its Bootstrap-based layout and existing backend routes while the table layer changes.

## Goals / Non-Goals

**Goals:**
- Remove the jQuery DataTables dependency from the shared UI path.
- Make the React table implementation the default for list-based manager screens.
- Preserve current list workflows, especially row selection and bulk actions.
- Keep backend routes and payloads unchanged during the migration.

**Non-Goals:**
- Introduce a third-party React data grid.
- Redesign list page semantics, routing, or backend data models.
- Add new table capabilities beyond what the manager screens already need.

## Decisions

### 1. Use the existing React table component as the replacement path
The migration should extend the current `SelectableTable`/`ManagerPage` pattern rather than introducing a new grid abstraction.

Why:
- The app already has working React list views that use this pattern.
- Reusing the existing component stack minimizes churn and reduces parity risk.
- It keeps the replacement small enough to reason about and test.

Alternatives considered:
- Add a new table library: faster to start, but it reintroduces a heavy dependency and duplicates behavior the app already owns.
- Keep DataTables for some screens: would leave the dependency and split list behavior across two systems.

### 2. Preserve server-backed lists and CRUD flows
The table should render the rows the page already fetches, instead of taking over filtering, persistence, or data loading concerns.

Why:
- The app already has route-driven pages and server-backed CRUD handlers.
- Keeping the server as the source of truth avoids a wider data architecture change.
- It reduces the chance of introducing inconsistent client-side list state.

Alternatives considered:
- Add client-side table state for search/sort/paging: possible later, but not required for removing DataTables and would add unnecessary complexity now.

### 3. Remove DataTables assets only after the React path is the default
The shared layout should stop loading DataTables once the React list implementation covers the affected screens.

Why:
- It avoids a partial cutover where both table systems remain required.
- It makes the dependency cleanup auditable and reversible at the route level if needed.

Alternatives considered:
- Remove the dependency immediately: too risky if any page still relies on DataTables behavior.

## Risks / Trade-offs

- [Behavior mismatch] Existing pages may rely on implicit DataTables behaviors that are not obvious from the codebase. → Mitigate by validating the current list screens against the React table contract before removing the dependency.
- [Large-table performance] Rendering large result sets in React could become expensive if paging or server-side filtering is not handled carefully. → Mitigate by keeping the current server-backed list flow and avoiding unnecessary client-side transformations.
- [Cutover risk] Removing shared DataTables assets too early could break an overlooked page. → Mitigate by migrating and verifying list screens before deleting the shared includes and dependency entries.

## Migration Plan

1. Confirm which pages currently depend on the shared DataTables assets and map them to React equivalents.
2. Extend the existing React table component as needed to cover the required list behaviors.
3. Cut over the affected manager/list screens to the React table path.
4. Remove the DataTables asset includes from `views/head.ejs` and the package dependencies once the React path is verified.
5. Validate the migrated screens and retain a rollback path by restoring the shared asset includes if a missed dependency is found.

## Open Questions

- Are there any hidden or legacy pages still depending on DataTables behavior outside the React manager screens?
- Do any list pages require client-side search, sort, or paging beyond the current React table contract?
- Should table selection remain part of the shared table primitive, or be split into a separate bulk-selection wrapper later?
