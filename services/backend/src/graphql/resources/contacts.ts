// The Contact resource: a person the CRM keeps, and the query that lists them.
import type { Contact } from "../../contacts";
import { builder } from "../builder";
import { viewerRequired } from "../viewer-required";

const ContactType = builder.objectRef<Contact>("Contact").implement({
  description: "A person the CRM keeps. Signed-in users only.",
  fields: (t) => ({
    id: t.exposeID("id", { description: "The contact's id." }),
    name: t.exposeString("name", { description: "The contact's name." }),
    email: t.exposeString("email", {
      description: "The contact's email address.",
    }),
    createdAt: t.string({
      description: "When the contact was created, an ISO 8601 UTC time.",
      resolve: (contact) => contact.createdAt.toISOString(),
    }),
  }),
});

builder.queryField("contacts", (t) =>
  t.field({
    type: [ContactType],
    description:
      "Every contact, the most recently created first. Fails with UNAUTHENTICATED when signed out.",
    resolve: (_root, _args, context) => {
      viewerRequired(context);
      return context.contacts.list();
    },
  }),
);
