import { expect, test } from "bun:test";
import { MockedProvider } from "@apollo/client/testing/react";
import type { MockLink } from "@apollo/client/testing";
import { render, screen } from "@testing-library/react";
import { ContactsPage } from "@/pages/contacts/ContactsPage";
import { ApiOriginContext } from "@/services/graphql/origin";
import {
  contactsAnswer,
  contactsOffline,
  people,
} from "../../../support/contacts";
import { expectReloadNotice } from "../../../support/reload";

function show(mock: MockLink.MockedResponse): void {
  render(
    <ApiOriginContext value="http://api.test">
      <MockedProvider mocks={[mock]}>
        <ContactsPage />
      </MockedProvider>
    </ApiOriginContext>,
  );
}

test("[contacts-319a4d] the page lists each contact's name and email in order", async () => {
  show(contactsAnswer(people));
  expect(screen.getByRole("heading", { name: "Contacts" })).toBeDefined();
  const items = await screen.findAllByRole("listitem");
  expect(items.map((item) => item.textContent)).toEqual([
    "Grace Hoppergrace@example.com",
    "Ada Lovelaceada@example.com",
  ]);
  expect(screen.queryByText("No contacts yet.")).toBeNull();
});

test("while loading, the page says so", () => {
  show(contactsAnswer(people, 10_000));
  expect(screen.getByText("Loading…")).toBeDefined();
  expect(screen.queryByRole("list")).toBeNull();
});

test("[contacts-8e85f9] no contacts says so, with no list", async () => {
  show(contactsAnswer([]));
  expect(await screen.findByText("No contacts yet.")).toBeDefined();
  expect(screen.getByRole("heading", { name: "Contacts" })).toBeDefined();
  expect(screen.queryByRole("list")).toBeNull();
});

test.each([
  ["a failed request", contactsOffline],
  ["a malformed answer", contactsAnswer([{ __typename: "Contact" }])],
] as const)(
  "[contacts-a1ea3e] %s shows the notice, and Reload reloads",
  async (_case, mock) => {
    show(mock);
    await expectReloadNotice("Couldn't load contacts.");
    expect(screen.queryByRole("list")).toBeNull();
  },
);
