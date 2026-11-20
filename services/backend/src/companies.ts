// The companies the CRM tracks: validating a new one, and the Companies port
// the `companies` resolvers reach data through; src/db/companies.ts implements
// it over the companies table.
import { GraphQLError } from "graphql";

export type Company = {
  id: string;
  name: string;
  /** Null when the company has none. */
  website: string | null;
  /** ISO 8601. */
  createdAt: string;
};

/** A company to store: already validated and trimmed. */
type NewCompany = { name: string; website: string | null };

/** The reads and writes companies need; src/db/companies.ts implements them. */
export type Companies = {
  /** Every company, ordered by name ignoring case. */
  list: () => Promise<Company[]>;
  /** Stores the company; null when its name is taken ignoring case. */
  create: (company: NewCompany) => Promise<Company | null>;
};

const NAME_MAX = 200;
const WEBSITE_MAX = 2000;

function badInput(message: string): GraphQLError {
  return new GraphQLError(message, { extensions: { code: "BAD_USER_INPUT" } });
}

function validName(name: string): string {
  const trimmed = name.trim();
  if (trimmed === "" || trimmed.length > NAME_MAX) {
    throw badInput(`The name must have 1 to ${String(NAME_MAX)} characters.`);
  }
  return trimmed;
}

function validWebsite(website: string | null | undefined): string | null {
  const trimmed = website?.trim() ?? "";
  if (trimmed === "") return null;
  const url = URL.parse(trimmed);
  const web = url?.protocol === "http:" || url?.protocol === "https:";
  if (!web || trimmed.length > WEBSITE_MAX) {
    throw badInput("The website must be an http or https URL.");
  }
  return trimmed;
}

/** Every company, ordered by name ignoring case. */
export function listCompanies(companies: Companies): Promise<Company[]> {
  return companies.list();
}

/** Validates and stores a company; refuses a name that is taken ignoring case. */
export async function createCompany(
  companies: Companies,
  input: { name: string; website?: string | null | undefined },
): Promise<Company> {
  const created = await companies.create({
    name: validName(input.name),
    website: validWebsite(input.website),
  });
  if (created === null) {
    throw new GraphQLError("A company with this name already exists.", {
      extensions: { code: "DUPLICATE_COMPANY" },
    });
  }
  return created;
}
