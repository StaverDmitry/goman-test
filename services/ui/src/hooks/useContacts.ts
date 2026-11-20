import { useQuery } from "@apollo/client/react";
import { use } from "react";
import { z } from "zod";
import { ContactsQuery } from "@/services/graphql/contacts";
import { ApiOriginContext } from "@/services/graphql/origin";

// The API's answer is untrusted: anything but these contacts has failed.
const contactsAnswer = z.object({
  contacts: z.array(
    z.object({ id: z.string(), name: z.string(), email: z.string() }),
  ),
});

export type ContactsState =
  | { status: "loading"; contacts?: undefined }
  | { status: "failed" }
  | { status: "ready"; contacts: z.infer<typeof contactsAnswer>["contacts"] };

/** The contacts, newest first. A failed request, or no API, has failed. */
export function useContacts(): ContactsState {
  const configured = use(ApiOriginContext) !== undefined;
  const { data, error } = useQuery(ContactsQuery, { skip: !configured });
  if (!configured || error) return { status: "failed" };
  if (data === undefined) return { status: "loading" };
  const answer = contactsAnswer.safeParse(data);
  // The parse keeps only the fields above, so Apollo's __typename stays out.
  return answer.success
    ? { status: "ready", contacts: answer.data.contacts }
    : { status: "failed" };
}
