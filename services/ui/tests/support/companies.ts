import type { MockLink } from "@apollo/client/testing";
import {
  CompaniesQuery,
  CreateCompanyMutation,
} from "@/services/graphql/companies";

export const acme = {
  __typename: "Company",
  id: "c1",
  name: "Acme Co",
  website: "https://acme.example",
};
export const bare = {
  __typename: "Company",
  id: "c2",
  name: "Bare Ltd",
  website: null,
};

/** The companies query answered with these `companies`, `times` times. */
export function companiesAnswer(
  companies: unknown,
  times = Number.POSITIVE_INFINITY,
  delay = 0,
): MockLink.MockedResponse {
  return {
    request: { query: CompaniesQuery },
    result: { data: { companies } },
    delay,
    maxUsageCount: times,
  };
}

/** The companies query failing as a network error would. */
export const companiesOffline: MockLink.MockedResponse = {
  request: { query: CompaniesQuery },
  error: new Error("offline"),
};

/** createCompany with these variables storing `company`. */
export function createAnswer(
  variables: { name: string; website: string },
  company: unknown,
): MockLink.MockedResponse {
  return {
    request: { query: CreateCompanyMutation, variables },
    result: { data: { createCompany: company } },
  };
}

/** createCompany with these variables refused with this error code. */
export function createRefused(
  variables: { name: string; website: string },
  code: string,
): MockLink.MockedResponse {
  return {
    request: { query: CreateCompanyMutation, variables },
    result: {
      errors: [{ message: "refused", extensions: { code } }],
    },
  };
}

/** createCompany failing as a network error would. */
export function createOffline(variables: {
  name: string;
  website: string;
}): MockLink.MockedResponse {
  return {
    request: { query: CreateCompanyMutation, variables },
    error: new Error("offline"),
  };
}
