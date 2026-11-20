import type { ReactElement } from "react";

// The top of a screen: its heading and a line of what it is for.
export function PageHeader({
  title,
  lead,
}: {
  title: string;
  lead: string;
}): ReactElement {
  return (
    <div className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      <p className="text-muted-foreground">{lead}</p>
    </div>
  );
}
