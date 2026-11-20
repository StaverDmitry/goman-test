# Spec Delta

## Purpose

The organisations the CRM tracks: the API that lists and creates companies, and the screen where a signed-in user sees and adds them.

## ADDED Requirements

### Requirement: The companies query lists every company
The API's `companies` query SHALL answer a signed-in request with every company, ordered by name ignoring case, each with its id, name, website (null when it has none) and created date.

#### Scenario: [companies-0d6ff4] A signed-in request lists the companies
- **WHEN** a signed-in client creates companies "Zeta Ltd" and "alpha Inc" and sends `{ companies { id name website createdAt } }`
- **THEN** both are in the answer, "alpha Inc" before "Zeta Ltd", each with its id and a created date

### Requirement: The createCompany mutation adds a company
The API's `createCompany` mutation SHALL, for a signed-in request with a name and an optional website, store a company and answer with it.

#### Scenario: [companies-374e43] A company is created
- **WHEN** a signed-in client sends `createCompany` with the name " Acme Co " and the website `https://acme.example`
- **THEN** it gets a company named "Acme Co" with that website, and the `companies` query then lists it

#### Scenario: [companies-7b6354] The website is optional
- **WHEN** a signed-in client sends `createCompany` with only a name
- **THEN** it gets a company whose website is null

### Requirement: A company name is unique ignoring case
The API SHALL refuse `createCompany` with a GraphQL error whose `extensions.code` is `DUPLICATE_COMPANY` when a company already has that name ignoring case, and store nothing.

#### Scenario: [companies-de0690] A duplicate name is refused
- **WHEN** a company "Acme Co" exists and a signed-in client sends `createCompany` with the name "ACME CO"
- **THEN** the answer has an error with `extensions.code` `DUPLICATE_COMPANY`, and `companies` still lists one company with that name

### Requirement: A company needs a valid name and website
The API SHALL refuse `createCompany` with a GraphQL error whose `extensions.code` is `BAD_USER_INPUT`, and store nothing, when the name is empty after trimming or longer than 200 characters, or the website is not an `http` or `https` URL.

#### Scenario: [companies-3560b8] An invalid company is refused
- **WHEN** a signed-in client sends `createCompany` with a blank name, or with a website `not a url`
- **THEN** each answer has an error with `extensions.code` `BAD_USER_INPUT`, and no company is stored

### Requirement: Only a signed-in user reads or adds companies
The API SHALL refuse the `companies` query and the `createCompany` mutation to a request without a valid session with a GraphQL error whose `extensions.code` is `UNAUTHENTICATED`, and store nothing.

#### Scenario: [companies-41cec2] A signed-out request is refused
- **WHEN** a client without a valid session sends the `companies` query, and the `createCompany` mutation
- **THEN** each answer has `data: null` and an error with `extensions.code` `UNAUTHENTICATED`, and no company is stored

### Requirement: The companies screen lists the companies
The UI SHALL show a signed-in user, at `/companies`, a "Companies" screen listing each company's name and website read from the `companies` query, or "No companies yet." when there are none.

#### Scenario: [companies-dd9575] The screen lists the API's companies
- **WHEN** a signed-in user opens `/companies` and the API has a company with a website and one without
- **THEN** the page shows the "Companies" heading and each company's name, with the website of the one that has it

#### Scenario: [companies-37c793] An empty list says so
- **WHEN** a signed-in user opens `/companies` and the API has no companies
- **THEN** the page shows "No companies yet."

### Requirement: The companies screen adds a company
The UI SHALL offer on the companies screen an "Add company" form with a name and an optional website that creates a company and shows it in the list, and that shows an error and saves nothing when the name is already taken.

#### Scenario: [companies-18ebec] A company is added
- **WHEN** a signed-in user fills the form with a new name and a website and submits it
- **THEN** the list shows the new company with its website, and the form is empty

#### Scenario: [companies-028d81] A duplicate name shows an error
- **WHEN** a signed-in user submits the form with the name of a company that exists, in other letter case
- **THEN** the page shows "A company with this name already exists." and the list is unchanged
