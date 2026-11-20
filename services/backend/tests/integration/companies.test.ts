import { afterEach, expect, test } from "bun:test";
import { z } from "zod";
import { appServers, graphql, signedInCookie } from "../support/server";

const apps = appServers();
afterEach(apps.close);

const LIST = "{ companies { id name website createdAt } }";

function create(name: string, website?: string): string {
  const site =
    website === undefined ? "" : `, website: ${JSON.stringify(website)}`;
  return `mutation { createCompany(name: ${JSON.stringify(name)}${site}) { id name website createdAt } }`;
}

const company = z.object({
  id: z.string().min(1),
  name: z.string(),
  website: z.string().nullable(),
  createdAt: z.iso.datetime(),
});
const listed = z.object({ data: z.object({ companies: z.array(company) }) });
const created = z.object({ data: z.object({ createCompany: company }) });
const code = z.object({
  errors: z.tuple([z.object({ extensions: z.object({ code: z.string() }) })]),
});

async function signedIn(): Promise<{ base: string; cookie: string }> {
  const base = await apps.startSeeded();
  return { base, cookie: await signedInCookie(base) };
}

async function names(base: string, cookie: string): Promise<string[]> {
  const answer = listed.parse(await graphql(base, LIST, cookie));
  return answer.data.companies.map((entry) => entry.name);
}

test("[companies-0d6ff4] a signed-in request lists the companies by name", async () => {
  const { base, cookie } = await signedIn();
  await graphql(base, create("Zeta Ltd"), cookie);
  await graphql(base, create("alpha Inc"), cookie);
  expect(await names(base, cookie)).toEqual(["alpha Inc", "Zeta Ltd"]);
});

test("[companies-374e43] a company is created and listed", async () => {
  const { base, cookie } = await signedIn();
  const answer = created.parse(
    await graphql(base, create(" Acme Co ", "https://acme.example"), cookie),
  );
  expect(answer.data.createCompany).toMatchObject({
    name: "Acme Co",
    website: "https://acme.example",
  });
  expect(await names(base, cookie)).toEqual(["Acme Co"]);
});

test("[companies-7b6354] the website is optional", async () => {
  const { base, cookie } = await signedIn();
  const answer = created.parse(await graphql(base, create("Acme"), cookie));
  expect(answer.data.createCompany.website).toBeNull();
});

test("[companies-de0690] a duplicate name is refused and nothing is saved", async () => {
  const { base, cookie } = await signedIn();
  await graphql(base, create("Acme Co"), cookie);
  const answer = code.parse(await graphql(base, create("ACME CO"), cookie));
  expect(answer.errors[0].extensions.code).toBe("DUPLICATE_COMPANY");
  expect(await names(base, cookie)).toEqual(["Acme Co"]);
});

test.each([create("   "), create("Acme", "not a url")])(
  "[companies-3560b8] an invalid company is refused: %s",
  async (mutation) => {
    const { base, cookie } = await signedIn();
    const answer = code.parse(await graphql(base, mutation, cookie));
    expect(answer.errors[0].extensions.code).toBe("BAD_USER_INPUT");
    expect(await names(base, cookie)).toEqual([]);
  },
);

test.each([undefined, "better-auth.session_token=forged"])(
  "[companies-41cec2] a signed-out request is refused: %p",
  async (cookie) => {
    const { base, cookie: session } = await signedIn();
    for (const query of [LIST, create("Acme")]) {
      expect(await graphql(base, query, cookie)).toMatchObject({
        data: null,
        errors: [{ extensions: { code: "UNAUTHENTICATED" } }],
      });
    }
    expect(await names(base, session)).toEqual([]);
  },
);
