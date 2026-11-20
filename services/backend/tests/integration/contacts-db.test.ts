import { expect, test } from "bun:test";
import { databaseContacts } from "../../src/db/contacts";
import { contacts } from "../../src/db/schema";
import { migratedDatabase } from "../support/database";

test("contacts created at the same instant come in a stable order", async () => {
  const db = await migratedDatabase();
  const createdAt = new Date("2026-11-11T00:00:00Z");
  await db.insert(contacts).values([
    {
      id: "00000000-0000-4000-8000-000000000001",
      name: "A",
      email: "a@example.com",
      createdAt,
    },
    {
      id: "00000000-0000-4000-8000-000000000002",
      name: "B",
      email: "b@example.com",
      createdAt,
    },
  ]);
  const listed = await databaseContacts(db).list();
  expect(listed.map((contact) => contact.name)).toEqual(["B", "A"]);
  expect(listed[0]?.createdAt).toEqual(createdAt);
});
