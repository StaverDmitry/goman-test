# Tasks

<!-- Plan written by superpowers:writing-plans. See design.md for the approach. -->

## 1. Backend: table, port and query (tests first)

- [ ] 1.1 [backend] Write failing tests: `tests/integration/contacts.test.ts` for `[contacts-4b0094]` (empty list, newest first against the real database) and `[contacts-cbe8c7]` (signed out and forged cookie refused); `tests/integration/contacts-db.test.ts` for the ordering tiebreak
- [ ] 1.2 [backend] Add `src/db/schema/contacts.ts`, export it from the schema index, run `bun run db:generate` (migration `contacts`)
- [ ] 1.3 [backend] Add the `Contacts` port (`src/contacts.ts`), its database implementation (`src/db/contacts.ts`), the `Contact` and `contacts` resource, context and app wiring, and the test server's dependency; tests pass
- [ ] 1.4 [backend] `bin/contracts generate`; commit `contracts/schema.graphql`
- [ ] 1.5 [backend] `bin/check backend` passes
- [ ] 1.6 [backend] Commit: `[2][b78132] backend: Add the contacts table and query`

## 2. UI: navigation link and contacts page (tests first)

- [ ] 2.1 [ui] Write failing tests for the hook (ready, loading, failed, malformed), the page (list, empty state, failed notice), the nav link and the route, for `[contacts-1ae31b]`, `[contacts-319a4d]`, `[contacts-8e85f9]`, `[contacts-a1ea3e]`
- [ ] 2.2 [ui] Add `services/graphql/contacts.ts`, regenerate types, `useContacts`, `pages/contacts/ContactsPage.tsx`, the `/contacts` route, the nav link and the English strings; tests pass
- [ ] 2.3 [ui] `bin/check ui` passes
- [ ] 2.4 [ui] Commit: `[2][b78132] ui: Add the contacts page and navigation link`

## 3. End-to-end tests and proof

- [ ] 3.1 [e2e] `tests/contacts.spec.ts`: `[contacts-4b0094]`, `[contacts-cbe8c7]` through the API; `[contacts-1ae31b]`, `[contacts-8e85f9]` on the real stack; `[contacts-319a4d]` with the `Contacts` request answered in the browser; `[contacts-a1ea3e]` with it aborted
- [ ] 3.2 [repo] `bin/up`, `bin/e2e --changed`, use the page in a browser, `bin/e2e --proof --change 2-b78132-contacts-list -- --grep "contacts-"`, commit the proof
- [ ] 3.3 [e2e] Commit: `[2][b78132] e2e: Cover the contacts scenarios`

Approved by the agent in automatic mode on 2026-11-20.
