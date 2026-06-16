## Why

The app still ships jQuery DataTables assets through the shared layout even though the React UI already has native table primitives. That keeps a legacy dependency alive for list screens without adding value, and it makes the UI harder to standardize and evolve.

## What Changes

- Replace shared jQuery DataTables asset loading with a native React table approach for the manager/list screens that currently rely on table-based interactions.
- Expand the existing React table components so they cover the behaviors the app needs without requiring DataTables.
- Keep server routes and data contracts intact while the table layer is migrated.
- **BREAKING** Remove the jQuery DataTables dependency and related asset includes from the shared page head once the React replacement is in place.

## Capabilities

### New Capabilities
- `native-react-table`: React-based list rendering for property-management screens, including row selection and the table behaviors needed by existing manager workflows.

### Modified Capabilities
- 

## Impact

- Shared layout asset loading in `views/head.ejs`.
- Front-end dependencies in `package.json`.
- React table components under `src/ui/components/` and any manager pages that consume them.
- Legacy list-screen scripts or markup that assume DataTables behavior.
