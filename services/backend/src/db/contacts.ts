// The contacts list's read over the contacts table.
import { desc } from "drizzle-orm";
import { z } from "zod";
import type { Contacts } from "../contacts";
import type { AnyDatabase } from "./connection";
import { contacts } from "./schema";

// Rows are untrusted until parsed, like every value read back from the database.
const rows = z.array(
  z.object({
    id: z.string(),
    name: z.string(),
    email: z.string(),
    createdAt: z.date(),
  }),
);

/** Contacts over the database's contacts table. */
export function databaseContacts(db: AnyDatabase): Contacts {
  return {
    list: async () =>
      rows.parse(
        await db
          .select({
            id: contacts.id,
            name: contacts.name,
            email: contacts.email,
            createdAt: contacts.createdAt,
          })
          .from(contacts)
          .orderBy(desc(contacts.createdAt), desc(contacts.id)),
      ),
  };
}
