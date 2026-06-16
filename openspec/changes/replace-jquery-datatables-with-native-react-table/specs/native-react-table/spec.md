## ADDED Requirements

### Requirement: Native React table rendering
The system SHALL render list-based manager screens with a native React table component instead of jQuery DataTables.

#### Scenario: Manager page loads without DataTables
- **WHEN** a migrated manager or list screen is opened
- **THEN** the screen SHALL render its rows through React table components
- **AND THEN** the screen SHALL not require jQuery DataTables assets to function

### Requirement: Row selection support
The system SHALL allow users to select and deselect individual rows and select or clear all visible rows from the table header.

#### Scenario: User toggles row selection
- **WHEN** the user checks or unchecks a row checkbox
- **THEN** the table SHALL update that row’s selected state

#### Scenario: User selects all visible rows
- **WHEN** the user uses the header checkbox to select all rows
- **THEN** the table SHALL select every visible row
- **AND THEN** the header checkbox SHALL reflect the aggregate selection state

### Requirement: Column rendering contract
The system SHALL render table columns from a page-provided column definition and SHALL support custom cell rendering for derived values.

#### Scenario: Derived column content is displayed
- **WHEN** a column definition provides a custom render function
- **THEN** the table SHALL display the rendered value for that cell

### Requirement: Optional footer labels
The system SHALL support an optional footer label row for list screens that need a footer summary or repeated column labels.

#### Scenario: Footer labels are provided
- **WHEN** a page supplies footer labels to the table
- **THEN** the table SHALL render a footer row matching the supplied labels

### Requirement: Legacy DataTables removal
The system SHALL not depend on jQuery DataTables assets for the migrated React list screens.

#### Scenario: Shared layout is updated
- **WHEN** the migrated screens are deployed
- **THEN** the shared page head SHALL no longer need DataTables script or stylesheet includes for those screens
