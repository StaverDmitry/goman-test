# Tasks

<!-- Plan written by superpowers:writing-plans. See design.md for the approach. -->

Each task starts with failing tests written from the scenarios, then the code. Patterns to copy: `dashboard.ts`, `db/user-stats.ts`, `resources/dashboard.ts`, `tests/integration/dashboard.test.ts` (backend); `useDashboard`, `DashboardPage`, `LoginForm` and their tests (ui); `tests/dashboard.spec.ts` (e2e).

## 1. Naming rule plural

- [ ] 1.1 [backend] Test `[contracts-a949e4]` in `tests/unit/contracts-schema.test.ts`: a `[Company!]!` query named `companies` passes, `companys` fails with `name it companies`, `[Day!]!` named `days` passes. Run it and see it fail.
- [ ] 1.2 [backend] In `tests/support/naming.ts` make `resourceName` replace a trailing consonant plus `y` with `ies`, else add `s`; run the test green.
- [ ] 1.3 [backend] Commit `[8][0cf305] backend: Pluralise a consonant and y as ies in the naming rule`.

## 2. Backend companies

- [ ] 2.1 [backend] Add `src/db/schema/companies.ts` (uuid `id` default random, `name` not null, nullable `website`, `...timestamps`, `uniqueIndex` on `lower(name)`) and export it from `schema/index.ts`; run `bun run db:generate` for the migration.
- [ ] 2.2 [backend] Unit-test `src/companies.ts` validation (trim, 1 to 200 characters, empty website is none, `http`/`https` only, at most 2000 characters) with a fake `Companies` port; `[companies-3560b8]`. Implement `Company`, `Companies`, `CompanyInput` validation and `createCompany`/`listCompanies` domain functions, throwing `BAD_USER_INPUT` and `DUPLICATE_COMPANY` `GraphQLError`s.
- [ ] 2.3 [backend] Integration-test `src/db/companies.ts` over the test database (ordering ignoring case, case-insensitive duplicate stores nothing, duplicate under concurrent creation stores one); implement `databaseCompanies(db)` with `onConflictDoNothing`.
- [ ] 2.4 [backend] Integration tests in `tests/integration/companies.test.ts` for `[companies-0d6ff4]`, `[companies-374e43]`, `[companies-7b6354]`, `[companies-de0690]`, `[companies-3560b8]`, `[companies-41cec2]` over a seeded app. Then add `Context.companies`, `resources/company.ts` (`Company` type, `companies` query, `createCompany` mutation, both calling `viewerRequired`), import it in `schema.ts`, wire `companies: databaseCompanies(db)` in `app.ts`, `server.ts` and `tests/support/server.ts`.
- [ ] 2.5 [backend] `bin/contracts generate`, then `bin/check` for backend (coverage 100%, no unused code); commit `[8][0cf305] backend: Add companies and createCompany`.

## 3. UI companies screen

- [ ] 3.1 [ui] Add `services/graphql/companies.ts` (`CompaniesQuery`, `CreateCompanyMutation`) and regenerate the types with `bin/contracts generate`.
- [ ] 3.2 [ui] Test then implement `hooks/useCompanies.ts` (loading, failed, ready; zod-parsed answer) and `hooks/useCreateCompany.ts` (resolves ready, maps a `DUPLICATE_COMPANY` error to a `duplicate` result, anything else to `failed`, and refetches the list on success).
- [ ] 3.3 [ui] Test then implement `pages/companies/CompaniesPage.tsx` and its list and form components for `[companies-dd9575]`, `[companies-37c793]`, `[companies-18ebec]`, `[companies-028d81]` and the failed-load notice; add the copy to `locales/en/common.json` (no copy elsewhere).
- [ ] 3.4 [ui] Test then add the `/companies` route in `app/routes.tsx` and the "Companies" `NavLink` in `AppHeader.tsx` (update its story and tests) for `[app-shell-0710e1]`.
- [ ] 3.5 [ui] `bin/check` for ui (coverage, i18n keys, story ids, lint); commit `[8][0cf305] ui: Add the companies screen`.

## 4. End-to-end

- [ ] 4.1 [e2e] Add `tests/companies.spec.ts` with a title citing each scenario ID: `[companies-0d6ff4]`, `[companies-374e43]`, `[companies-7b6354]`, `[companies-de0690]`, `[companies-3560b8]`, `[companies-41cec2]` against the API (unique company names per run); `[companies-dd9575]`, `[companies-37c793]` (empty list mocked with `page.route`), `[companies-18ebec]`, `[companies-028d81]` and `[app-shell-0710e1]` in the browser. Add a `fixtures/companies.ts` helper if the specs share a request.
- [ ] 4.2 [e2e] Run `bin/up`, `bin/e2e --changed`, `bin/e2e --gates`; commit `[8][0cf305] e2e: Cover the companies scenarios`.

## 5. Prove

- [ ] 5.1 [repo] Use the screen in the Orca browser; `bin/e2e --proof --change 8-0cf305-companies -- --grep "<companies and app-shell scenario IDs>"` and commit the `proof/` screenshots.

Approved by the agent in automatic mode on 2026-11-20.
