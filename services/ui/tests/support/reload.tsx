import { expect, spyOn } from "bun:test";
import { fireEvent, screen } from "@testing-library/react";

/** Expects the load-failed notice titled `title`, and its Reload button to reload the page. */
export async function expectReloadNotice(title: string): Promise<void> {
  const reload = spyOn(window.location, "reload").mockImplementation(
    () => undefined,
  );
  expect(await screen.findByRole("heading", { name: title })).toBeDefined();
  expect(screen.getByText("Reload to try again.")).toBeDefined();
  fireEvent.click(screen.getByRole("button", { name: "Reload" }));
  expect(reload).toHaveBeenCalledTimes(1);
  reload.mockRestore();
}

/** Expects `show` with no API origin to fail at once and send no request. */
export function expectNoRequest(show: () => void): void {
  const fetchSpy = spyOn(globalThis, "fetch");
  show();
  expect(fetchSpy).not.toHaveBeenCalled();
  fetchSpy.mockRestore();
}
