import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Notice } from "@/components/Notice";
import { Button } from "@/components/ui/button";

/** What a page shows in place of its data when loading it failed: a title, a hint and Reload. */
export function LoadFailedNotice({
  title,
  body,
}: {
  title: string;
  body: string;
}): ReactElement {
  const { t } = useTranslation();
  return (
    <Notice title={title} body={body}>
      <Button
        onClick={() => {
          window.location.reload();
        }}
      >
        {t("error.reload")}
      </Button>
    </Notice>
  );
}
