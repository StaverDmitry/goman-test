import type { ReactElement } from "react";
import { useTranslation } from "react-i18next";
import { Notice } from "./Notice";
import { Button } from "./ui/button";

// What a screen shows when its data could not be loaded: a notice with one
// action that reloads the page.
export function ReloadNotice({
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
