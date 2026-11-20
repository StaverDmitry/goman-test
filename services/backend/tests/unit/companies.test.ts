import { expect, test } from "bun:test";
import { GraphQLError } from "graphql";
import {
  createCompany,
  listCompanies,
  type Companies,
  type Company,
} from "../../src/companies";

// A Companies port over an array: a name taken ignoring case is a duplicate.
function fakeCompanies(): Companies & { stored: Company[] } {
  const stored: Company[] = [];
  return {
    stored,
    list: () => Promise.resolve(stored),
    create: (input) => {
      const taken = stored.some(
        (company) => company.name.toLowerCase() === input.name.toLowerCase(),
      );
      if (taken) return Promise.resolve(null);
      const company = {
        id: String(stored.length),
        ...input,
        createdAt: "2026-11-20T10:00:00.000Z",
      };
      stored.push(company);
      return Promise.resolve(company);
    },
  };
}

async function codeOf(attempt: Promise<unknown>): Promise<unknown> {
  const error: unknown = await attempt.catch((caught: unknown) => caught);
  return error instanceof GraphQLError ? error.extensions.code : error;
}

test("a company is stored with a trimmed name and website", async () => {
  const companies = fakeCompanies();
  const company = await createCompany(companies, {
    name: " Acme Co ",
    website: " https://acme.example ",
  });
  expect(company).toMatchObject({
    name: "Acme Co",
    website: "https://acme.example",
  });
  expect(await listCompanies(companies)).toEqual([company]);
});

test.each([undefined, null, "", "   "])(
  "[companies-7b6354] a missing website (%p) is stored as none",
  async (website) => {
    const company = await createCompany(fakeCompanies(), {
      name: "Acme",
      website,
    });
    expect(company.website).toBeNull();
  },
);

test.each([
  ["a blank name", { name: "   " }],
  ["a name over 200 characters", { name: "a".repeat(201) }],
  ["a website that is not a URL", { name: "A", website: "not a url" }],
  ["a website that is not http", { name: "A", website: "ftp://a.example" }],
  ["a javascript website", { name: "A", website: "javascript:alert(1)" }],
  [
    "a website over 2000 characters",
    { name: "A", website: `https://a.example/${"a".repeat(2000)}` },
  ],
])(
  "[companies-3560b8] %s is refused and nothing is stored",
  async (_, input) => {
    const companies = fakeCompanies();
    expect(await codeOf(createCompany(companies, input))).toBe(
      "BAD_USER_INPUT",
    );
    expect(companies.stored).toEqual([]);
  },
);

test("a name of exactly 200 characters is accepted", async () => {
  const company = await createCompany(fakeCompanies(), {
    name: "a".repeat(200),
  });
  expect(company.name).toHaveLength(200);
});

test("[companies-de0690] a duplicate name is refused", async () => {
  const companies = fakeCompanies();
  await createCompany(companies, { name: "Acme Co" });
  expect(await codeOf(createCompany(companies, { name: "ACME CO" }))).toBe(
    "DUPLICATE_COMPANY",
  );
  expect(companies.stored).toHaveLength(1);
});
