# Spec Delta

## Purpose
People in the CRM: the contacts the API keeps and returns, and the screen that lists them.

## ADDED Requirements

### Requirement: The contacts query lists every contact, newest first
The API's `contacts` query SHALL answer a signed-in request with every contact, each with its `id`, `name`, `email` and `createdAt`, the most recently created first, and an empty list when there are none.

#### Scenario: [contacts-4b0094] A signed-in request lists the contacts
- **WHEN** a signed-in client sends `{ contacts { id name email createdAt } }`
- **THEN** it gets every contact, ordered by `createdAt` from the newest to the oldest, or an empty list when none exist

### Requirement: Only a signed-in user lists contacts
The API SHALL refuse the `contacts` query to a request without a valid session with a GraphQL error whose `extensions.code` is `UNAUTHENTICATED`, and no contacts.

#### Scenario: [contacts-cbe8c7] A signed-out request is refused
- **WHEN** a client without a valid session sends the `contacts` query
- **THEN** the answer has `data: null` and an error with `extensions.code` `UNAUTHENTICATED`

### Requirement: The navigation links to the contacts page
The UI SHALL show a "Contacts" link in the primary navigation that opens `/contacts` and is marked as the current page there.

#### Scenario: [contacts-1ae31b] The Contacts link opens the page
- **WHEN** a signed-in user clicks "Contacts" in the navigation
- **THEN** the page is at `/contacts`, the "Contacts" link is marked as the current page and the page's "Contacts" heading is shown

### Requirement: The contacts page lists each contact's name and email
The UI SHALL show a signed-in user, at `/contacts`, a "Contacts" heading and one entry per contact the `contacts` query answers, in the order it answers them, each with the contact's name and email.

#### Scenario: [contacts-319a4d] The page lists the contacts
- **WHEN** a signed-in user opens `/contacts` and the `contacts` query answers contacts
- **THEN** the page shows each contact's name and email, newest first, and not "No contacts yet."

### Requirement: The contacts page says when there are no contacts
The UI SHALL show "No contacts yet." instead of a list when the `contacts` query answers no contacts.

#### Scenario: [contacts-8e85f9] An empty list says so
- **WHEN** a signed-in user opens `/contacts` and no contact exists
- **THEN** the page shows the "Contacts" heading and "No contacts yet.", and no list

### Requirement: A contacts page that fails to load says so
The UI SHALL replace the list, when the `contacts` query fails or answers something else, with a "Couldn't load contacts." notice that offers to reload.

#### Scenario: [contacts-a1ea3e] A failed load shows the notice
- **WHEN** the `contacts` request fails or its answer is malformed
- **THEN** the page shows "Couldn't load contacts." and a Reload button, and no list
