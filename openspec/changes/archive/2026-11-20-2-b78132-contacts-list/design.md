# Design

## Context

The dashboard is the template every feature copies: a domain module reached through a port on the GraphQL context, a database module implementing the port, a Pothos resource, the regenerated contract, a UI hook and page, and end-to-end tests. Contacts is the first CRM table; companies, deals and notes will hang off it. Issue #2 only lists contacts: nothing creates one yet.

## Goals / Non-Goals

**Goals:**
- A `contacts` table (name, email, created date) with a migration.
- A signed-in-only `contacts` query returning every contact, newest first.
- A "Contacts" navigation link and a `/contacts` page with an empty state.

**Non-Goals:**
- Adding, editing, deleting, searching or paging contacts, and seeding demo contacts.

## Decisions

- **Port on the context.** `src/contacts.ts` defines the `Contacts` port (`list()`); `src/db/contacts.ts` implements it over the table; `app.ts` and the test server take it as a dependency, like `userStats`. Agent's call: mirrors the dashboard so every feature looks the same.
- **Table.** `contacts(id uuid pk default random, name text not null, email text not null, created_at, updated_at)` using the shared `timestamps`. Agent's call: no unique email yet, because the issue does not ask for it and a later issue that adds contacts can decide; a uuid key avoids guessable ids.
- **Ordering.** The database sorts by `created_at` descending, then `id` descending as a tiebreak, so the order is stable.
- **GraphQL.** `Contact { id, name, email, createdAt }` with `createdAt` an ISO 8601 string (the schema has no date scalar and adding one is not needed). `contacts: [Contact!]!`, refused with `UNAUTHENTICATED` through `viewerRequired`. Agent's call: no pagination, as the issue says "every contact".
- **UI.** `useContacts` hook validating the answer with zod, `ContactsPage` under `pages/contacts/`, route `/contacts` before the `*` route, nav link `nav.contacts`. Failed load shows a notice with a Reload button, as the dashboard does. Agent's call: the page shows a plain list (name and email per row), as the issue asks for nothing more.
- **Tests.** Backend unit/integration tests for the query, ordering and refusal. Nothing can create a contact through the API, so the end-to-end tests read the real empty state and the real query shape, and show the populated list by answering the `Contacts` request in the browser with fixed contacts.
- **Capability.** A new `contacts` capability; the navigation link is a requirement of it, so `app-shell` is unchanged.

## Risks / Trade-offs

- The populated page is proven in the browser with a stubbed answer, since no feature creates contacts yet; ordering is proven against the real database in backend integration tests.
- An unbounded list will need paging when contacts are many; a later issue adds it.

Approved by the agent in automatic mode on 2026-11-20.
