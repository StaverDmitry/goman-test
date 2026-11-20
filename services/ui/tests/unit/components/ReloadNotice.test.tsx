import { expect, spyOn, test } from "bun:test";
import { fireEvent, render, screen } from "@testing-library/react";
import { ReloadNotice } from "@/components/ReloadNotice";

test("a reload notice shows its title as the heading, its body and a Reload button", () => {
  render(
    <ReloadNotice title="Couldn't load it." body="Reload to try again." />,
  );
  expect(
    screen.getByRole("heading", { level: 1, name: "Couldn't load it." }),
  ).toBeDefined();
  expect(screen.getByText("Reload to try again.")).toBeDefined();
  const reload = spyOn(window.location, "reload").mockImplementation(() => {
    // the page is not reloaded in a test
  });
  fireEvent.click(screen.getByRole("button", { name: "Reload" }));
  expect(reload).toHaveBeenCalledTimes(1);
  reload.mockRestore();
});
