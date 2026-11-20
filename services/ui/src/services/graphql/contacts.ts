import { graphql } from "./generated";

// Every contact, the most recently created first.
export const ContactsQuery = graphql(`
  query Contacts {
    contacts {
      id
      name
      email
    }
  }
`);
