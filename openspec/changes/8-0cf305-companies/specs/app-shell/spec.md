# Spec Delta

## ADDED Requirements

### Requirement: The navigation links to the companies screen
The UI's primary navigation SHALL include a "Companies" link to `/companies`, marked as the current page on that screen and only there.

#### Scenario: [app-shell-0710e1] The Companies link opens the companies screen
- **WHEN** a signed-in user clicks the "Companies" navigation link
- **THEN** the page shows the "Companies" heading at `/companies`, with that link marked current and the "Dashboard" link not
