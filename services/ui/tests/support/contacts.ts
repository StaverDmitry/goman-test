import type { MockLink } from "@apollo/client/testing";
import { ContactsQuery } from "@/services/graphql/contacts";

/** Two contacts, newest first. */
export const people = [
  {
    __typename: "Contact",
    id: "c2",
    name: "Grace Hopper",
    email: "grace@example.com",
  },
  {
    __typename: "Contact",
    id: "c1",
    name: "Ada Lovelace",
    email: "ada@example.com",
  },
];

/** The contacts query answered with this `contacts` value, as often as asked. */
export function contactsAnswer(
  contacts: unknown,
  delay = 20,
): MockLink.MockedResponse {
  return {
    request: { query: ContactsQuery },
    result: { data: { contacts } },
    delay,
    maxUsageCount: Number.POSITIVE_INFINITY,
  };
}

/** The contacts query failing as a network error would. */
export const contactsOffline: MockLink.MockedResponse = {
  request: { query: ContactsQuery },
  error: new Error("offline"),
};
