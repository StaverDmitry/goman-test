import { expect, test } from "bun:test";
import { render, screen } from "@testing-library/react";
import { PageHeader } from "@/components/PageHeader";

test("a page header shows its title as the heading, with its lead", () => {
  render(<PageHeader title="Companies" lead="Who you work with." />);
  expect(
    screen.getByRole("heading", { level: 1, name: "Companies" }),
  ).toBeDefined();
  expect(screen.getByText("Who you work with.")).toBeDefined();
});
