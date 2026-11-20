// The companies reads and writes over the companies table.
import { asc, sql } from "drizzle-orm";
import type { Companies, Company } from "../companies";
import type { AnyDatabase } from "./connection";
import { companies } from "./schema";

type Row = typeof companies.$inferSelect;

function company(row: Row): Company {
  return {
    id: row.id,
    name: row.name,
    website: row.website,
    createdAt: row.createdAt.toISOString(),
  };
}

/** Companies over the database's companies table. */
export function databaseCompanies(db: AnyDatabase): Companies {
  return {
    list: async () => {
      const rows = await db
        .select()
        .from(companies)
        .orderBy(asc(sql`lower(${companies.name})`), asc(companies.id));
      return rows.map(company);
    },
    // The unique index on lower(name) decides a duplicate, so two racing
    // requests store one: the loser inserts nothing.
    create: async (input) => {
      const rows = await db
        .insert(companies)
        .values(input)
        .onConflictDoNothing()
        .returning();
      const [row] = rows;
      return row === undefined ? null : company(row);
    },
  };
}
