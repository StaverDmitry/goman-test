import { CombinedGraphQLErrors } from "@apollo/client";
import { useMutation } from "@apollo/client/react";
import {
  CompaniesQuery,
  CreateCompanyMutation,
} from "@/services/graphql/companies";

/** ok: stored; duplicate: the name is taken; failed: nothing was stored. */
export type CreateResult = "ok" | "duplicate" | "failed";

function duplicate(error: unknown): boolean {
  return (
    CombinedGraphQLErrors.is(error) &&
    error.errors.some((entry) => entry.extensions?.code === "DUPLICATE_COMPANY")
  );
}

/** Adds a company, then refreshes the list. An empty website is none. */
export function useCreateCompany(): (
  name: string,
  website: string,
) => Promise<CreateResult> {
  const [create] = useMutation(CreateCompanyMutation, {
    refetchQueries: [CompaniesQuery],
    awaitRefetchQueries: true,
  });
  return async (name, website) => {
    try {
      await create({ variables: { name, website } });
      return "ok";
    } catch (error) {
      return duplicate(error) ? "duplicate" : "failed";
    }
  };
}
