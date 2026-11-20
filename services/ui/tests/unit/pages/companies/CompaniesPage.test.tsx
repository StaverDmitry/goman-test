import { expect, test } from "bun:test";
import { MockedProvider } from "@apollo/client/testing/react";
import type { MockLink } from "@apollo/client/testing";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { CompaniesPage } from "@/pages/companies/CompaniesPage";
import { at } from "../../../support/defined";
import { ApiOriginContext } from "@/services/graphql/origin";
import {
  acme,
  bare,
  companiesAnswer,
  companiesOffline,
  createAnswer,
  createOffline,
  createRefused,
} from "../../../support/companies";

function show(...mocks: MockLink.MockedResponse[]): void {
  render(
    <ApiOriginContext value="http://api.test">
      <MockedProvider mocks={mocks}>
        <CompaniesPage />
      </MockedProvider>
    </ApiOriginContext>,
  );
}

function fill(name: string, website: string): void {
  fireEvent.change(screen.getByLabelText("Name"), { target: { value: name } });
  fireEvent.change(screen.getByLabelText("Website (optional)"), {
    target: { value: website },
  });
  fireEvent.click(screen.getByRole("button", { name: "Add company" }));
}

test("[companies-dd9575] the page lists each company's name and website", async () => {
  show(companiesAnswer([acme, bare]));
  expect(screen.getByRole("heading", { name: "Companies" })).toBeDefined();
  expect(screen.getByText("Loading…")).toBeDefined();
  const list = await screen.findByRole("list", { name: "Company list" });
  const items = within(list).getAllByRole("listitem");
  const first = within(at(items, 0, "companies"));
  const second = within(at(items, 1, "companies"));
  expect(first.getByText("Acme Co")).toBeDefined();
  expect(
    first
      .getByRole("link", { name: "https://acme.example" })
      .getAttribute("href"),
  ).toBe("https://acme.example");
  expect(second.getByText("Bare Ltd")).toBeDefined();
  expect(second.queryByRole("link")).toBeNull();
});

test("[companies-37c793] an empty list says so", async () => {
  show(companiesAnswer([]));
  expect(await screen.findByText("No companies yet.")).toBeDefined();
  expect(screen.queryByRole("list")).toBeNull();
});

test("a failed load shows the notice and offers to reload", async () => {
  show(companiesOffline);
  expect(
    await screen.findByRole("heading", {
      name: "Couldn't load the companies.",
    }),
  ).toBeDefined();
  expect(screen.queryByRole("form", { name: "Add company" })).toBeNull();
  expect(screen.getByRole("button", { name: "Reload" })).toBeDefined();
});

test("[companies-18ebec] an added company is listed and the form is cleared", async () => {
  const variables = { name: "Acme Co", website: "https://acme.example" };
  show(
    companiesAnswer([], 1),
    createAnswer(variables, acme),
    companiesAnswer([acme], 1),
  );
  await screen.findByText("No companies yet.");
  fill(variables.name, variables.website);
  expect(
    screen.getByRole("button", { name: "Adding…" }).hasAttribute("disabled"),
  ).toBe(true);
  expect(await screen.findByText("https://acme.example")).toBeDefined();
  expect(screen.getByLabelText<HTMLInputElement>("Name").value).toBe("");
  expect(screen.queryByRole("alert")).toBeNull();
});

test("[companies-028d81] a duplicate name shows an error and keeps the form", async () => {
  const variables = { name: "ACME CO", website: "" };
  show(companiesAnswer([acme]), createRefused(variables, "DUPLICATE_COMPANY"));
  await screen.findByText("Acme Co");
  fill("ACME CO", "");
  const alert = await screen.findByRole("alert");
  expect(alert.textContent).toBe("A company with this name already exists.");
  expect(screen.getByLabelText<HTMLInputElement>("Name").value).toBe("ACME CO");
  expect(screen.getAllByRole("listitem")).toHaveLength(1);
});

test.each([
  ["another error code", createRefused({ name: "X", website: "" }, "OTHER")],
  ["a network error", createOffline({ name: "X", website: "" })],
])("%s shows that the company was not added", async (_case, mock) => {
  show(companiesAnswer([]), mock);
  await screen.findByText("No companies yet.");
  fill("X", "");
  expect((await screen.findByRole("alert")).textContent).toBe(
    "Couldn't add the company. Try again.",
  );
});
