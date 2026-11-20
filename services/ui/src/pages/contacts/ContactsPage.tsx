import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { useContacts } from "@/hooks/useContacts";
import { LoadFailedNotice } from "@/components/LoadFailedNotice";

// The people the CRM keeps: each contact's name and email, newest first.
export function ContactsPage(): ReactElement {
  const { t } = useTranslation();
  const state = useContacts();
  if (state.status === "failed") {
    return (
      <LoadFailedNotice
        title={t("contacts.failed")}
        body={t("contacts.retry")}
      />
    );
  }
  const { contacts } = state; // undefined while loading
  return (
    <section className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">
        {t("contacts.title")}
      </h1>
      {contacts === undefined ? (
        <p className="text-muted-foreground">{t("contacts.loading")}</p>
      ) : contacts.length === 0 ? (
        <p className="text-muted-foreground">{t("contacts.empty")}</p>
      ) : (
        <ul className="divide-y divide-border rounded-md border border-border">
          {contacts.map((contact) => (
            <li key={contact.id} className="px-4 py-3">
              <p className="font-medium">{contact.name}</p>
              <p className="text-muted-foreground">{contact.email}</p>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
