import { afterEach, expect, test } from "bun:test";
import { z } from "zod";
import { appServers, graphql, signedInCookie } from "../support/server";

const apps = appServers();
afterEach(apps.close);

const CONTACTS = "{ contacts { id name email createdAt } }";

const contactsAnswer = z.object({
  data: z.object({
    contacts: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        email: z.string(),
        createdAt: z.string(),
      }),
    ),
  }),
});

test("[contacts-4b0094] a signed-in request lists the contacts, newest first", async () => {
  const base = await apps.startSeeded({
    contacts: [
      {
        name: "Old",
        email: "old@example.com",
        createdAt: "2026-11-01T10:00:00Z",
      },
      {
        name: "New",
        email: "new@example.com",
        createdAt: "2026-11-19T10:00:00Z",
      },
      {
        name: "Mid",
        email: "mid@example.com",
        createdAt: "2026-11-10T10:00:00Z",
      },
    ],
  });
  const answer = contactsAnswer.parse(
    await graphql(base, CONTACTS, await signedInCookie(base)),
  );
  const { contacts } = answer.data;
  expect(contacts.map((contact) => contact.name)).toEqual([
    "New",
    "Mid",
    "Old",
  ]);
  expect(contacts[0]).toMatchObject({
    email: "new@example.com",
    createdAt: "2026-11-19T10:00:00.000Z",
  });
  expect(contacts[0]?.id).toMatch(/^[0-9a-f-]{36}$/);
});

test("[contacts-4b0094] with no contacts the list is empty", async () => {
  const base = await apps.startSeeded();
  expect(await graphql(base, CONTACTS, await signedInCookie(base))).toEqual({
    data: { contacts: [] },
  });
});

test.each([undefined, "better-auth.session_token=forged"])(
  "[contacts-cbe8c7] a signed-out request is refused: %p",
  async (cookie) => {
    const base = await apps.startSeeded({
      contacts: [
        {
          name: "Ada",
          email: "ada@example.com",
          createdAt: "2026-11-01T10:00:00Z",
        },
      ],
    });
    expect(await graphql(base, CONTACTS, cookie)).toMatchObject({
      data: null,
      errors: [
        {
          message: "Sign in to see this.",
          extensions: { code: "UNAUTHENTICATED" },
        },
      ],
    });
  },
);
