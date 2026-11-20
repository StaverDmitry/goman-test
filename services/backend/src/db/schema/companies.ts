import { sql } from "drizzle-orm";
import { pgTable, text, uniqueIndex, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./timestamps";

// An organisation the CRM tracks. Names are unique ignoring case: the index
// on lower(name) is what refuses a duplicate, however many requests race.
export const companies = pgTable(
  "companies",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    website: text("website"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("companies_name_lower_idx").on(sql`lower(${table.name})`),
  ],
);
