import { MockedProvider } from "@apollo/client/testing/react";
import type { MockLink } from "@apollo/client/testing";
import { spyOn } from "bun:test";
import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { ApiOriginContext } from "@/services/graphql/origin";

/**
 * Renders a data hook's state as JSON in an <output> (role status), with
 * these mocked answers and this API origin (undefined: not configured).
 */
export function showHook(
  useHook: () => unknown,
  mocks: MockLink.MockedResponse[],
  origin: string | undefined,
): void {
  function Probe(): ReactElement {
    return <output>{JSON.stringify(useHook())}</output>;
  }
  render(
    <ApiOriginContext value={origin}>
      <MockedProvider mocks={mocks}>
        <Probe />
      </MockedProvider>
    </ApiOriginContext>,
  );
}

/**
 * Shows a data hook with no API origin and reports what it rendered and how
 * many requests left the page.
 */
export function showUnconfigured(useHook: () => unknown): {
  state: string | null;
  requests: number;
} {
  const fetchSpy = spyOn(globalThis, "fetch");
  showHook(useHook, [], undefined);
  const result = {
    state: screen.getByRole("status").textContent,
    requests: fetchSpy.mock.calls.length,
  };
  fetchSpy.mockRestore();
  return result;
}
