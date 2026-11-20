// The Company resource: the organisations the CRM tracks. Signed-in users only.
import { createCompany, listCompanies, type Company } from "../../companies";
import { builder } from "../builder";
import { viewerRequired } from "../viewer-required";

const CompanyType = builder.objectRef<Company>("Company").implement({
  description: "An organisation the CRM tracks.",
  fields: (t) => ({
    id: t.exposeString("id", { description: "The company's id." }),
    name: t.exposeString("name", {
      description: "The company's name, unique ignoring case.",
    }),
    website: t.exposeString("website", {
      nullable: true,
      description: "The company's http or https website, if it has one.",
    }),
    createdAt: t.exposeString("createdAt", {
      description: "When the company was added, ISO 8601.",
    }),
  }),
});

builder.queryField("companies", (t) =>
  t.field({
    type: [CompanyType],
    description:
      "Every company, ordered by name. Fails with UNAUTHENTICATED when signed out.",
    resolve: (_root, _args, context) => {
      viewerRequired(context);
      return listCompanies(context.companies);
    },
  }),
);

builder.mutationField("createCompany", (t) =>
  t.field({
    type: CompanyType,
    description:
      "Adds a company. Fails with UNAUTHENTICATED when signed out, BAD_USER_INPUT for an invalid name or website and DUPLICATE_COMPANY when the name is taken.",
    args: {
      name: t.arg.string({ required: true }),
      website: t.arg.string(),
    },
    resolve: (_root, args, context) => {
      viewerRequired(context);
      return createCompany(context.companies, args);
    },
  }),
);
