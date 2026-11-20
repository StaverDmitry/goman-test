# Spec Delta

## ADDED Requirements

### Requirement: The naming rule pluralises a consonant and y as ies
The naming rule SHALL name a root query returning a list of a resource whose name ends in a consonant and `y` with `ies` in place of the `y`, and any other list with an added `s`.

#### Scenario: [contracts-a949e4] A list of companies is named companies
- **WHEN** the schema has a query returning `[Company!]!`
- **THEN** the naming test accepts `companies`, rejects `companys`, and still accepts `days` for `[Day!]!`
- **NO E2E** internal-rule: services/backend/tests/unit/contracts-schema.test.ts
