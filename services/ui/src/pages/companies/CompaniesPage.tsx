import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { PageHeader } from "@/components/PageHeader";
import { ReloadNotice } from "@/components/ReloadNotice";
import { useCompanies } from "@/hooks/useCompanies";
import { useCreateCompany } from "@/hooks/useCreateCompany";
import { AddCompanyForm } from "./AddCompanyForm";

// The companies a signed-in user sees: a form to add one, and the list of
// every company with its website.
export function CompaniesPage(): ReactElement {
  const { t } = useTranslation();
  const state = useCompanies();
  const add = useCreateCompany();
  if (state.status === "failed") {
    return (
      <ReloadNotice title={t("companies.failed")} body={t("companies.retry")} />
    );
  }
  const { companies } = state; // undefined while loading
  return (
    <section className="space-y-6">
      <PageHeader title={t("companies.title")} lead={t("companies.lead")} />
      <AddCompanyForm onAdd={add} />
      {companies === undefined && (
        <p className="text-muted-foreground">{t("companies.loading")}</p>
      )}
      {companies?.length === 0 && (
        <p className="text-muted-foreground">{t("companies.empty")}</p>
      )}
      {companies !== undefined && companies.length > 0 && (
        <ul
          aria-label={t("companies.list")}
          className="divide-y divide-border rounded-xl ring-1 ring-foreground/10"
        >
          {companies.map((company) => (
            <li
              key={company.id}
              className="flex flex-wrap items-baseline justify-between gap-x-4 px-4 py-3"
            >
              <span className="font-medium">{company.name}</span>
              {company.website !== null && (
                <a
                  href={company.website}
                  rel="noopener noreferrer"
                  className="text-sm text-muted-foreground underline-offset-4 hover:underline"
                >
                  {company.website}
                </a>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
