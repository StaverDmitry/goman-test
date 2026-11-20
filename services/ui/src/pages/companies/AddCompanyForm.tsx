import { useState, type ReactElement, type SubmitEvent } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formText } from "@/lib/form-text";
import type { CreateResult } from "@/hooks/useCreateCompany";

type Status = "idle" | "pending" | Exclude<CreateResult, "ok">;

// A name and an optional website. While an add is pending the button says so
// and is disabled; a stored company clears the fields, a refused or failed
// one says why and keeps them.
export function AddCompanyForm({
  onAdd,
}: {
  onAdd: (name: string, website: string) => Promise<CreateResult>;
}): ReactElement {
  const { t } = useTranslation();
  const [status, setStatus] = useState<Status>("idle");

  async function submit(event: SubmitEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    setStatus("pending");
    const result = await onAdd(
      formText(data, "name"),
      formText(data, "website"),
    );
    setStatus(result === "ok" ? "idle" : result);
    if (result === "ok") form.reset();
  }

  const pending = status === "pending";

  const message = {
    idle: undefined,
    pending: undefined,
    duplicate: t("companies.duplicate"),
    failed: t("companies.createFailed"),
  }[status];

  return (
    <form
      aria-label={t("companies.add")}
      className="space-y-4"
      onSubmit={(event) => {
        void submit(event);
      }}
    >
      {message !== undefined && (
        <p role="alert" className="text-sm font-medium text-destructive">
          {message}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="company-name">{t("companies.name")}</Label>
          <Input
            id="company-name"
            name="name"
            required
            maxLength={200}
            aria-invalid={status === "duplicate" || undefined}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="company-website">{t("companies.websiteLabel")}</Label>
          <Input id="company-website" name="website" type="url" />
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {t(pending ? "companies.adding" : "companies.add")}
      </Button>
    </form>
  );
}
