import { randomUUID } from "node:crypto";
import { graphql } from "./api";

/* Companies as the API answers them, for tests that set up or check state
   over HTTP. A name carries a run-unique suffix so tests stay independent on
   a stack whose database keeps every company. */

/** A company name no other test or run uses, starting with `label`. */
export function uniqueName(label: string): string {
  return `${label} ${randomUUID().slice(0, 8)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

/** The mutation that adds a company; the website is left out when undefined. */
export function createMutation(name: string, website?: string): string {
  const site =
    website === undefined ? "" : `, website: ${JSON.stringify(website)}`;
  return `mutation { createCompany(name: ${JSON.stringify(name)}${site}) { id name website createdAt } }`;
}

/** Adds a company over the API; throws unless the API answered with it. */
export async function addCompany(
  cookie: string,
  name: string,
  website?: string,
): Promise<void> {
  const answer = await graphql(createMutation(name, website), cookie);
  const data = isRecord(answer) ? answer.data : undefined;
  if (!isRecord(data) || !isRecord(data.createCompany)) {
    throw new Error(`not a created company: ${JSON.stringify(answer)}`);
  }
}

/** The names `companies` answers for this cookie, in the API's order. */
export async function companyNames(cookie: string): Promise<string[]> {
  const answer = await graphql("{ companies { name } }", cookie);
  const data = isRecord(answer) ? answer.data : undefined;
  const companies = isRecord(data) ? data.companies : undefined;
  if (!Array.isArray(companies)) {
    throw new Error(`not the companies: ${JSON.stringify(answer)}`);
  }
  const entries: unknown[] = companies;
  return entries.map((entry) => {
    if (isRecord(entry) && typeof entry.name === "string") return entry.name;
    throw new Error(`not a company: ${JSON.stringify(entry)}`);
  });
}
