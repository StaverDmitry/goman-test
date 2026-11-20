import { expect, test } from "bun:test";
import { databaseCompanies } from "../../src/db/companies";
import { migratedDatabase } from "../support/database";

test("a name taken ignoring case stores nothing, even when requests race", async () => {
  const companies = databaseCompanies(await migratedDatabase());
  const results = await Promise.all(
    ["Acme", "ACME", "acme"].map((name) =>
      companies.create({ name, website: null }),
    ),
  );
  expect(results.filter((result) => result !== null)).toHaveLength(1);
  expect(await companies.list()).toHaveLength(1);
});

test("companies are listed by name ignoring case, then id", async () => {
  const companies = databaseCompanies(await migratedDatabase());
  for (const name of ["b", "C", "A"]) {
    await companies.create({ name, website: null });
  }
  expect((await companies.list()).map((entry) => entry.name)).toEqual([
    "A",
    "b",
    "C",
  ]);
});
