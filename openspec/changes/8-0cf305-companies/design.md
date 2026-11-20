# Design

## Context

The CRM tracks users but not the organisations deals are made with (issue 8). The dashboard is the worked example every feature copies: a table-backed domain port in `services/backend/src/` (`dashboard.ts` with `UserStats`, implemented in `src/db/user-stats.ts`), a Pothos resource in `src/graphql/resources/`, the committed `contracts/schema.graphql`, the generated UI client, a hook and a page in `services/ui`, and a Playwright spec per scenario in `services/e2e`. The `companies` capability has no spec yet and no code, so there is no baseline to backfill.

The naming rule lives in `services/backend/tests/support/naming.ts`: a list query is the resource name plus `s`, so `[Company!]!` would have to be named `companys`.

## Goals / Non-Goals

**Goals:**
- A `companies` table, a `companies` query and a `createCompany` mutation, for signed-in users only.
- The naming rule knows the English plural of a word ending in a consonant plus `y`.
- A "Companies" navigation link and a `/companies` page listing name and website, with an "Add company" form.

**Non-Goals:**
- Linking contacts to companies, editing or deleting companies, search, pagination.
- Per-user ownership: every signed-in user sees the same companies.

## Decisions

- **Data.** Table `companies`: `id` uuid primary key (default random), `name` text not null, `website` text null, `created_at` timestamptz not null default now (the shared `timestamps` helper, which also adds `updated_at`). Uniqueness ignoring case is a unique index on `lower(name)`, so the database, not a read-then-write check, is the truth. One expand-only migration generated with `bun run db:generate`.
- **Domain port.** `src/companies.ts` holds the `Company` type, the input validation and a `Companies` port (`list`, `create`), like `dashboard.ts`/`UserStats`; `src/db/companies.ts` implements it over Drizzle. `create` inserts with `onConflictDoNothing`; no returned row means a duplicate, so no driver error codes are parsed and a race between two requests still stores one. The port reaches resolvers through `Context.companies`, wired in `app.ts`, `server.ts` and the test server support.
- **Validation.** The name is trimmed and must be 1 to 200 characters. The website is optional: trimmed, an empty string means none, otherwise it must parse as an `http` or `https` URL and be at most 2000 characters. A bad value is a GraphQL error with code `BAD_USER_INPUT`.
- **GraphQL.** `Company { id name website createdAt }` in `resources/company.ts`; `createdAt` is an ISO-8601 string (no custom scalar exists). `companies: [Company!]!` ordered by name ignoring case, then id; `createCompany(name: String!, website: String): Company!`. Both call `viewerRequired` first, so a signed-out request gets `UNAUTHENTICATED`. A duplicate name fails with code `DUPLICATE_COMPANY` and stores nothing.
- **Naming rule.** `resourceName` pluralises a name ending in a consonant plus `y` by replacing the `y` with `ies`, otherwise adds `s` (vowel plus `y`, such as `Day`, stays `days`). A unit test covers `Company` → `companies` and the unchanged cases. `NAMING_EXCEPTIONS` stays empty.
- **UI.** `services/ui/src/pages/companies/CompaniesPage.tsx` at `/companies`, inside the signed-in layout. A `useCompanies` hook parses the answer with zod like `useDashboard`; a `createCompany` mutation refetches the list. Empty list shows "No companies yet.". The "Add company" form has Name and Website fields and an "Add company" submit button; a `DUPLICATE_COMPANY` error shows "A company with this name already exists." and clears nothing; a successful add clears the form. A failed load shows "Couldn't load the companies." with a Reload button, as the dashboard does. The header gets a "Companies" `NavLink`; the dashboard link keeps `end`, so only one link is current. All copy lives in `locales/en/common.json`.
- **Specs.** New capability `companies` (API and page behaviour); `app-shell` gains the navigation link; `contracts` gains the plural rule.
- **No new dependency.**
- **Agent's call: one change.** The issue is one review-sized vertical slice (the dashboard is one too), so there is one change, not a backend change and a UI change.
- **Agent's call: uuid ids and a `DUPLICATE_COMPANY` code.** The auth tables use text ids because better-auth owns them; the new table is ours, so a database uuid is simplest. A specific error code lets the form show the right message without matching on text.
- **Agent's call: website as plain validated text, shown as a link.** The issue says "optional website" only; accepting only http(s) keeps `javascript:` URLs out of a rendered link.
- **Agent's call: sort by name.** The list needs a stable order; alphabetical, ignoring case, is what a reader scanning for a company expects.
- **Agent's call: pluralisation scope.** Only the consonant-plus-`y` rule the issue asks for; no general inflection library.

## Risks / Trade-offs

- A unique index on `lower(name)` is not expressible with Drizzle's column-level `.unique()`; it uses the `uniqueIndex().on(sql\`lower(...)\`)` form, and `db:verify` must accept the generated snapshot.
- Case-insensitive duplicates are by `lower()`, not by locale collation, so accented capitals may count as different names. Acceptable for a first version.
- Several end-to-end tests add companies to a shared database; tests use unique names so they stay independent.

Approved by the agent in automatic mode on 2026-11-20.
