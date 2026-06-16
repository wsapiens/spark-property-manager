## ADDED Requirements

### Requirement: React-based page shell
The system MUST render the application navigation, page header, and main content areas through React-managed UI components on migrated screens.

#### Scenario: Open a migrated screen
- **WHEN** a user opens a migrated dashboard or manager page
- **THEN** the page displays the expected navigation and content regions through the React UI shell

### Requirement: React replacements for shared widgets
The system MUST provide React-based interactions for the shared UI patterns used across migrated screens, including date picking, collapsible sections, dialogs, and bulk row selection.

#### Scenario: Choose a date
- **WHEN** a user interacts with a date field on a migrated screen
- **THEN** the user can select and clear dates and the workflow receives the chosen value

#### Scenario: Toggle a collapsible section
- **WHEN** a user expands or collapses a panel
- **THEN** the content visibility updates and the control reflects the current state

#### Scenario: Select table rows
- **WHEN** a user uses the table header checkbox on a migrated table
- **THEN** the matching rows are selected or cleared consistently

### Requirement: Workflow parity for existing screens
The system MUST preserve the existing create, edit, filter, report, and bulk action workflows for properties, units, tenants, vendors, payments, expenses, imports, work items, and dashboard reporting.

#### Scenario: Complete an existing workflow
- **WHEN** a user performs a task that existed before the migration
- **THEN** the workflow completes successfully using the same application data and backend routes
