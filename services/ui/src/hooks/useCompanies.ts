import { useQuery } from "@apollo/client/react";
import { use } from "react";
import { z } from "zod";
import { CompaniesQuery } from "@/services/graphql/companies";
import { ApiOriginContext } from "@/services/graphql/origin";

// The API's answer is untrusted: anything but these companies has failed.
const companiesAnswer = z.object({
  companies: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      website: z.string().nullable(),
    }),
  ),
});

type Company = z.infer<typeof companiesAnswer>["companies"][number];

export type CompaniesState =
  | { status: "loading"; companies?: undefined }
  | { status: "failed" }
  | { status: "ready"; companies: Company[] };

/** The companies. A failed request, or no API, has failed. */
export function useCompanies(): CompaniesState {
  const configured = use(ApiOriginContext) !== undefined;
  const { data, error } = useQuery(CompaniesQuery, { skip: !configured });
  if (!configured || error) return { status: "failed" };
  if (data === undefined) return { status: "loading" };
  const answer = companiesAnswer.safeParse(data);
  // The parse keeps only the fields above, so Apollo's __typename stays out.
  return answer.success
    ? { status: "ready", companies: answer.data.companies }
    : { status: "failed" };
}
