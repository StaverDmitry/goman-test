import { graphql } from "./generated";

// Every company, ordered by name.
export const CompaniesQuery = graphql(`
  query Companies {
    companies {
      id
      name
      website
    }
  }
`);

// Adds a company; the answer is the stored company.
export const CreateCompanyMutation = graphql(`
  mutation CreateCompany($name: String!, $website: String) {
    createCompany(name: $name, website: $website) {
      id
      name
      website
    }
  }
`);
