## Why

The current UI is built around jQuery UI widgets and page-specific imperative scripts, which makes the interface hard to evolve and reuse. Moving to React creates a component-based UI layer that is easier to maintain, standardize, and extend across the property, expense, payment, tenant, vendor, unit, import, work, and dashboard screens.

## What Changes

- Replace jQuery UI-driven interactions with React components for shared UI patterns such as date selection, dialogs, collapsible sections, and table controls.
- Rebuild the main app shell and page layouts so the existing screens render through React-managed views instead of ad hoc DOM manipulation.
- Consolidate repeated page behavior into reusable React components and shared state patterns.
- Preserve existing backend routes and data contracts while the UI layer is migrated.
- **BREAKING** Remove reliance on jQuery UI assets and legacy page scripts for the migrated screens.

## Capabilities

### New Capabilities
- `react-ui-migration`: React-based application UI that preserves the existing property-management workflows with reusable components and consistent interaction patterns.

### Modified Capabilities
- 

## Impact

- Front-end rendering in `views/*.ejs` and page scripts in `public/javascripts/*.js`.
- Asset loading in the shared page head, including removal of `jquery-ui-dist` and replacement of legacy UI dependencies where applicable.
- Build and delivery tooling needed to bundle and serve React components alongside the existing server app.
- Existing user flows for dashboard reporting, record editing, filtering, and bulk selection.
