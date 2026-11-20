import { expect, test } from "bun:test";
import type { MockLink } from "@apollo/client/testing";
import { screen } from "@testing-library/react";
import { useContacts } from "@/hooks/useContacts";
import {
  contactsAnswer,
  contactsOffline,
  people,
} from "../../support/contacts";
import { showHook } from "../../support/hook-probe";
import { expectNoRequest } from "../../support/reload";

function show(
  mocks: MockLink.MockedResponse[],
  origin: string | undefined,
): void {
  showHook(useContacts, mocks, origin);
}

test("the contacts load, then are ready in the order answered", async () => {
  show([contactsAnswer(people)], "http://api.test");
  expect(screen.getByRole("status").textContent).toBe('{"status":"loading"}');
  const ready = {
    status: "ready",
    contacts: people.map(({ id, name, email }) => ({ id, name, email })),
  };
  expect(await screen.findByText(JSON.stringify(ready))).toBeDefined();
});

test("no contacts is ready with an empty list", async () => {
  show([contactsAnswer([])], "http://api.test");
  expect(
    await screen.findByText('{"status":"ready","contacts":[]}'),
  ).toBeDefined();
});

test.each([
  ["a failed request", contactsOffline],
  [
    "a contact without an email",
    contactsAnswer([{ __typename: "Contact", id: "c1", name: "Ada" }]),
  ],
] as const)("%s has failed", async (_case, mock) => {
  show([mock], "http://api.test");
  expect(await screen.findByText('{"status":"failed"}')).toBeDefined();
});

test("without an API origin the contacts have failed and nothing is sent", () => {
  expectNoRequest(() => {
    show([], undefined);
  });
  expect(screen.getByRole("status").textContent).toBe('{"status":"failed"}');
});
