// The CRM's contacts: the people it keeps. It is the domain module the
// `contacts` resolver reaches data through; the reads it needs are the
// Contacts port, which src/db/contacts.ts implements over the contacts table.
export type Contact = {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
};

/** The reads the contacts list needs; src/db/contacts.ts implements them. */
export type Contacts = {
  /** Every contact, the most recently created first. */
  list: () => Promise<Contact[]>;
};
