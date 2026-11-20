import { pgTable, text, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./timestamps";

// A person the CRM keeps. Companies, deals and notes will hang off it.
export const contacts = pgTable("contacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  ...timestamps,
});
