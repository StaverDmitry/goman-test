import { expect, test } from "bun:test";
import type { MockLink } from "@apollo/client/testing";
import { screen } from "@testing-library/react";
import { useCompanies } from "@/hooks/useCompanies";
import {
  acme,
  bare,
  companiesAnswer,
  companiesOffline,
} from "../../support/companies";
import { showHook, showUnconfigured } from "../../support/hook-probe";

function show(
  mocks: MockLink.MockedResponse[],
  origin: string | undefined,
): void {
  showHook(useCompanies, mocks, origin);
}

test("the companies load, then are ready", async () => {
  show([companiesAnswer([acme, bare], 1, 20)], "http://api.test");
  expect(screen.getByRole("status").textContent).toBe('{"status":"loading"}');
  const ready = {
    status: "ready",
    companies: [
      { id: "c1", name: "Acme Co", website: "https://acme.example" },
      { id: "c2", name: "Bare Ltd", website: null },
    ],
  };
  expect(await screen.findByText(JSON.stringify(ready))).toBeDefined();
});

test.each([
  ["a failed request", companiesOffline],
  ["a name that is not text", companiesAnswer([{ ...acme, name: 1 }], 1)],
] as const)("%s has failed", async (_case, mock) => {
  show([mock], "http://api.test");
  expect(await screen.findByText('{"status":"failed"}')).toBeDefined();
});

test("without an API origin the companies have failed and nothing is sent", () => {
  expect(showUnconfigured(useCompanies)).toEqual({
    state: '{"status":"failed"}',
    requests: 0,
  });
});
