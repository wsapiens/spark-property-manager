## Context

The application is currently rendered through EJS templates with shared asset includes in `views/head.ejs` and page-specific imperative scripts in `public/javascripts/*.js`. The UI depends on jQuery UI widgets such as date pickers and dialogs, plus jQuery-driven table selection, collapsible sections, and inline DOM updates.

That structure works, but it makes the interface brittle to extend because behavior is spread across many page scripts and global selectors. The migration needs to preserve the current business workflows and backend routes while replacing the UI layer with React-managed components.

## Goals / Non-Goals

**Goals:**
- Introduce a React-based UI layer for the existing application screens.
- Preserve existing workflows, routes, and data contracts during the migration.
- Replace jQuery UI-dependent interactions with reusable React components.
- Enable incremental migration so individual pages can be cut over safely.

**Non-Goals:**
- Redesign the backend API surface or data model.
- Rewrite every screen into a single-page application in one step.
- Introduce a large third-party component framework unless a narrow widget need requires it.

## Decisions

### 1. Use React islands inside the existing server-rendered app
The migration should mount React entry points into the existing EJS pages rather than converting the whole app into a full SPA.

Why:
- The current app already has stable route-level page templates and server-side data flows.
- A phased approach limits risk and allows legacy and new UI to coexist during rollout.
- It keeps rollback simple: a page can fall back to its legacy script path if needed.

Alternatives considered:
- Full SPA rewrite: too much blast radius for a UI migration.
- Partial jQuery-to-React component swaps inside the existing scripts: reduces some work, but keeps the imperative architecture and slows long-term cleanup.

### 2. Build shared React components for common UI patterns
The migration should centralize the repeated behaviors currently implemented in page scripts: date inputs, collapsible sections, dialogs, bulk-selection tables, and page chrome.

Why:
- Those patterns appear across multiple screens and are the best leverage point for reuse.
- Shared components reduce drift between pages and make parity testing practical.
- It avoids recreating the same imperative jQuery code in multiple places.

Alternatives considered:
- Keep each page bespoke: faster initially, but preserves duplication and inconsistency.
- Adopt a large UI library: would speed some widgets, but increases bundle size and can force visual/behavioral compromises that do not match the existing application.

### 3. Prefer lightweight, explicit state and data helpers
Migrated screens should use React state and a small request helper around the existing backend routes instead of relying on jQuery AJAX and global DOM lookups.

Why:
- The current scripts mix data fetching, DOM mutation, and state management in the same handler chain.
- A small request helper keeps the code easy to test and avoids introducing a new global abstraction layer.
- This makes the React components deterministic and easier to reason about.

Alternatives considered:
- Retain jQuery AJAX in the React layer: possible, but it prolongs the old dependency model and does not improve maintainability much.
- Introduce a full client-side data framework: unnecessary for the current scope.

### 4. Keep Bootstrap as the visual baseline during migration
The app already uses Bootstrap for layout and styling, so the React layer should preserve that baseline while replacing only the interaction model.

Why:
- It minimizes visual churn during the migration.
- It avoids coupling the migration to a full redesign.
- It reduces the amount of CSS that must be rewritten at once.

Alternatives considered:
- Introduce a new design system: higher long-term value, but too much change for this migration.

## Risks / Trade-offs

- Dual runtime complexity and page-level cutover risk → Mitigate by keeping legacy entry points intact until each React page is validated.
- Behavior mismatches between jQuery UI widgets and React replacements → Mitigate with parity-focused acceptance tests for date picking, dialogs, table selection, and collapsible sections.
- Bundle and build-tooling overhead from introducing React → Mitigate with a minimal build pipeline and shared entry points instead of a heavy framework stack.
- Large data tables may regress if rendered naively in React → Mitigate by preserving server-backed filtering/querying and using controlled row rendering.

## Migration Plan

1. Add the React build/runtime dependencies and a minimal bundling path for the new UI entry points.
2. Create shared React shell and widget components for navigation, collapsible sections, dialogs, dates, and table selection.
3. Migrate the highest-value or highest-churn screens first so the shared components are exercised quickly.
4. Replace page-specific jQuery UI code with React entry points page by page while keeping backend routes unchanged.
5. Remove jQuery UI assets and unused legacy scripts after the last migrated screen is cut over.

Rollback:
- If a migrated page regresses, switch that route back to the legacy template/script path while keeping the React build artifacts in place.

## Open Questions

- Should date selection use native date inputs, a lightweight React datepicker, or a custom calendar component?
- Should table rendering replace the existing jQuery DataTables usage immediately or keep a transitional adapter for some screens?
- Which screen should be the first migration target to validate the shared React shell and widgets?
