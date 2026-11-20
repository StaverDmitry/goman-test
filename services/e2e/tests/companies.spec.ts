import { expect, test } from "@playwright/test";
import { demoSession, graphql } from "./fixtures/api";
import { signIn } from "./fixtures/auth";
import {
  addCompany,
  companyNames,
  createMutation,
  uniqueName,
} from "./fixtures/companies";

/* The companies API as a client sees it, against the demo user bin/up seeds. */

test("[companies-0d6ff4] a signed-in client lists the companies by name", async () => {
  const cookie = await demoSession();
  const zeta = uniqueName("Zeta Ltd");
  const alpha = uniqueName("alpha Inc");
  await addCompany(cookie, zeta);
  await addCompany(cookie, alpha);
  const names = await companyNames(cookie);
  expect(names).toContain(zeta);
  expect(names).toContain(alpha);
  expect(names.indexOf(alpha)).toBeLessThan(names.indexOf(zeta));
  const answer = await graphql("{ companies { id createdAt } }", cookie);
  expect(answer).toMatchObject({
    data: {
      companies: expect.arrayContaining([
        { id: expect.any(String), createdAt: expect.any(String) },
      ]),
    },
  });
});

test("[companies-374e43] a client creates a company", async () => {
  const cookie = await demoSession();
  const name = uniqueName("Acme Co");
  const answer = await graphql(
    createMutation(` ${name} `, "https://acme.example"),
    cookie,
  );
  expect(answer).toMatchObject({
    data: {
      createCompany: { name, website: "https://acme.example" },
    },
  });
  expect(await companyNames(cookie)).toContain(name);
});

test("[companies-7b6354] a company needs no website", async () => {
  const name = uniqueName("Bare Ltd");
  expect(
    await graphql(createMutation(name), await demoSession()),
  ).toMatchObject({ data: { createCompany: { name, website: null } } });
});

test("[companies-de0690] a duplicate name is refused", async () => {
  const cookie = await demoSession();
  const name = uniqueName("Dupe Co");
  await addCompany(cookie, name);
  expect(
    await graphql(createMutation(name.toUpperCase()), cookie),
  ).toMatchObject({ errors: [{ extensions: { code: "DUPLICATE_COMPANY" } }] });
  const same = (await companyNames(cookie)).filter(
    (entry) => entry.toLowerCase() === name.toLowerCase(),
  );
  expect(same).toEqual([name]);
});

test("[companies-3560b8] an invalid company is refused", async () => {
  const cookie = await demoSession();
  const before = await companyNames(cookie);
  for (const mutation of [
    createMutation("   "),
    createMutation(uniqueName("Bad site"), "not a url"),
  ]) {
    expect(await graphql(mutation, cookie)).toMatchObject({
      errors: [{ extensions: { code: "BAD_USER_INPUT" } }],
    });
  }
  expect(await companyNames(cookie)).toEqual(before);
});

test("[companies-41cec2] a signed-out client is refused", async () => {
  const name = uniqueName("Ghost Co");
  for (const query of ["{ companies { name } }", createMutation(name)]) {
    expect(await graphql(query)).toMatchObject({
      data: null,
      errors: [{ extensions: { code: "UNAUTHENTICATED" } }],
    });
  }
  expect(await companyNames(await demoSession())).not.toContain(name);
});

/* The same, as a person in the browser sees it. */

test("[companies-dd9575] the screen lists the companies", async ({ page }) => {
  const cookie = await demoSession();
  const withSite = uniqueName("Listed Co");
  const without = uniqueName("Unlisted Co");
  await addCompany(cookie, withSite, "https://listed.example");
  await addCompany(cookie, without);
  await signIn(page);
  await page.goto("/companies");
  const main = page.getByRole("main");
  await expect(main.getByRole("heading", { name: "Companies" })).toBeVisible();
  const list = main.getByRole("list", { name: "Company list" });
  const listed = list.getByRole("listitem").filter({ hasText: withSite });
  await expect(
    listed.getByRole("link", { name: "https://listed.example" }),
  ).toBeVisible();
  const bare = list.getByRole("listitem").filter({ hasText: without });
  await expect(bare).toBeVisible();
  await expect(bare.getByRole("link")).toHaveCount(0);
});

test("[companies-37c793] an empty list says so", async ({ page }) => {
  await signIn(page);
  // Answer only the companies query with no companies.
  await page.route("**/graphql", async (route) => {
    const body: unknown = route.request().postDataJSON();
    const companies =
      typeof body === "object" &&
      body !== null &&
      "operationName" in body &&
      body.operationName === "Companies";
    await (companies
      ? route.fulfill({ json: { data: { companies: [] } } })
      : route.continue());
  });
  await page.goto("/companies");
  await expect(page.getByRole("main")).toContainText("No companies yet.");
});

test("[companies-18ebec] a company is added from the form", async ({
  page,
}) => {
  const name = uniqueName("Added Co");
  await signIn(page);
  await page.goto("/companies");
  const main = page.getByRole("main");
  await main.getByLabel("Name").fill(name);
  await main.getByLabel("Website (optional)").fill("https://added.example");
  await main.getByRole("button", { name: "Add company" }).click();
  const added = main.getByRole("listitem").filter({ hasText: name });
  await expect(
    added.getByRole("link", { name: "https://added.example" }),
  ).toBeVisible();
  await expect(main.getByLabel("Name")).toHaveValue("");
  await expect(main.getByLabel("Website (optional)")).toHaveValue("");
});

test("[companies-028d81] a duplicate name shows an error", async ({ page }) => {
  const name = uniqueName("Twice Co");
  await addCompany(await demoSession(), name);
  await signIn(page);
  await page.goto("/companies");
  const main = page.getByRole("main");
  await expect(main.getByText(name)).toBeVisible();
  await main.getByLabel("Name").fill(name.toUpperCase());
  await main.getByRole("button", { name: "Add company" }).click();
  await expect(main.getByRole("alert")).toHaveText(
    "A company with this name already exists.",
  );
  await expect(main.getByLabel("Name")).toHaveValue(name.toUpperCase());
  await expect(
    main.getByRole("listitem").filter({ hasText: name }),
  ).toHaveCount(1);
});

test("[app-shell-0710e1] the Companies link opens the companies screen", async ({
  page,
}) => {
  await signIn(page);
  const nav = page.getByRole("navigation", { name: "Main" });
  await nav.getByRole("link", { name: "Companies" }).click();
  await expect(page).toHaveURL(/\/companies$/);
  await expect(
    page.getByRole("main").getByRole("heading", { name: "Companies" }),
  ).toBeVisible();
  await expect(nav.getByRole("link", { name: "Companies" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  await expect(
    nav.getByRole("link", { name: "Dashboard" }),
  ).not.toHaveAttribute("aria-current", "page");
});
