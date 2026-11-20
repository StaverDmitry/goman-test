# Proposal

**Issue:** #8
**Type:** feature
**Services:** backend, ui, e2e

## Why

The CRM tracks people but not the organisations they work for, which deals are made with. Companies are the next record the CRM needs before contacts can be linked to them.

## What Changes

- A `companies` table: name (required, unique ignoring case), optional website, created date.
- A `companies` query and a `createCompany` mutation, for signed-in users only.
- The naming rule pluralises a word ending in a consonant and `y` as `ies`, so `Company` is named `companies`.
- A "Companies" navigation link and a `/companies` page listing name and website, with an "Add company" form.

## Capabilities

### New Capabilities
- `companies`: the company records, the API that lists and creates them, and the screen that shows and adds them. It is the capability the product brief already names; no existing one fits.

### Modified Capabilities
- `app-shell`: the primary navigation gains a "Companies" link.
- `contracts`: the naming rule's plural handles a consonant followed by `y`.

## Impact

- backend: schema and migration, a companies domain module and its database implementation, a GraphQL resource, the regenerated `contracts/schema.graphql`, the naming rule's test support.
- ui: regenerated GraphQL types, a companies hook and page, a route, a navigation link, copy.
- e2e: a spec for the companies API and screen.
- No new dependency. Linking contacts to companies is out of scope.
