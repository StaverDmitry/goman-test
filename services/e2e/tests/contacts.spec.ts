import { expect, test } from "@playwright/test";
import { demoSession, graphql } from "./fixtures/api";
import { signIn } from "./fixtures/auth";

/* The contacts list as a client sees it. Nothing creates a contact yet, so
   the real stack's list is empty; the populated page answers the page's
   request itself. */

const CONTACTS = "{ contacts { id name email createdAt } }";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

// The createdAt times `contacts` answers for this session cookie.
async function createdTimes(cookie: string): Promise<number[]> {
  const answer = await graphql(CONTACTS, cookie);
  const data = isRecord(answer) ? answer.data : undefined;
  const contacts = isRecord(data) ? data.contacts : undefined;
  if (!Array.isArray(contacts)) {
    throw new Error(`not the contacts: ${JSON.stringify(answer)}`);
  }
  const entries: unknown[] = contacts;
  return entries.map((entry) => {
    if (isRecord(entry) && typeof entry.createdAt === "string") {
      return Date.parse(entry.createdAt);
    }
    throw new Error(`not a contact: ${JSON.stringify(entry)}`);
  });
}

test("[contacts-4b0094] a signed-in client lists the contacts, newest first", async () => {
  const times = await createdTimes(await demoSession());
  expect(times).toEqual(times.toSorted((a, b) => b - a));
});

test("[contacts-cbe8c7] a signed-out client is refused the contacts", async () => {
  expect(await graphql("{ contacts { id } }")).toMatchObject({
    data: null,
    errors: [{ extensions: { code: "UNAUTHENTICATED" } }],
  });
});

/* The same, as a person in the browser sees it. */

// Whether this request body is the page's Contacts query.
function isContactsQuery(body: unknown): boolean {
  return (
    isRecord(body) &&
    "operationName" in body &&
    body.operationName === "Contacts"
  );
}

test("[contacts-1ae31b] the Contacts link opens the contacts page", async ({
  page,
}) => {
  await signIn(page);
  const nav = page.getByRole("navigation", { name: "Main" });
  await nav.getByRole("link", { name: "Contacts" }).click();
  await expect(page).toHaveURL(/\/contacts$/);
  await expect(nav.getByRole("link", { name: "Contacts" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(
    page.getByRole("main").getByRole("heading", { name: "Contacts" }),
  ).toBeVisible();
});

test("[contacts-8e85f9] a page with no contacts says so", async ({ page }) => {
  await signIn(page);
  await page.goto("/contacts");
  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { name: "Contacts" })).toBeVisible();
  await expect(main.getByText("No contacts yet.")).toBeVisible();
  await expect(main.getByRole("list")).toHaveCount(0);
});

test("[contacts-319a4d] the page lists each contact's name and email", async ({
  page,
}) => {
  await signIn(page);
  await page.route("**/graphql", async (route) => {
    if (!isContactsQuery(route.request().postDataJSON())) {
      await route.continue();
      return;
    }
    await route.fulfill({
      json: {
        data: {
          contacts: [
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
          ],
        },
      },
    });
  });
  await page.goto("/contacts");
  const main = page.getByRole("main");
  const items = main.getByRole("listitem");
  await expect(items).toHaveCount(2);
  await expect(items.nth(0)).toContainText("Grace Hopper");
  await expect(items.nth(0)).toContainText("grace@example.com");
  await expect(items.nth(1)).toContainText("Ada Lovelace");
  await expect(items.nth(1)).toContainText("ada@example.com");
  await expect(main.getByText("No contacts yet.")).toHaveCount(0);
});

test("[contacts-a1ea3e] a failed contacts load shows the notice", async ({
  page,
}) => {
  await signIn(page);
  await page.route("**/graphql", async (route) => {
    await (isContactsQuery(route.request().postDataJSON())
      ? route.abort()
      : route.continue());
  });
  await page.goto("/contacts");
  const main = page.getByRole("main");
  await expect(
    main.getByRole("heading", { name: "Couldn't load contacts." }),
  ).toBeVisible();
  await expect(main.getByText("Reload to try again.")).toBeVisible();
  await expect(main.getByRole("list")).toHaveCount(0);
  await expect(main.getByRole("button", { name: "Reload" })).toBeVisible();
});
