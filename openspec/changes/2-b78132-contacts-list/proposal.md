# Proposal

**Issue:** #2
**Type:** feature
**Services:** backend, ui, e2e

## Why

The CRM has no people in it yet. Companies, deals and notes all hang off contacts, so the app first needs somewhere to keep and show them.

## What Changes

- A `contacts` table with a name, an email and a created date, and its migration.
- A `contacts` GraphQL query returning every contact, newest first, for signed-in users only; the contract is regenerated.
- A "Contacts" link in the navigation and a `/contacts` page listing each contact's name and email, saying "No contacts yet." when there are none.
- End-to-end tests for each scenario.

## Capabilities

### New Capabilities
- `contacts`: people in the CRM: the contacts query and the contacts page.

### Modified Capabilities

## Impact

- backend: schema, migration, `Contacts` port, GraphQL resource, `contracts/schema.graphql`.
- ui: route, nav link, page, hook, query, generated types, translations.
- e2e: `contacts.spec.ts`.
