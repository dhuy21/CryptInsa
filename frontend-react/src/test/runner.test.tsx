import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

function Probe() {
  return <p>runner ok</p>;
}

describe("test runner", () => {
  it("renders a React node in jsdom", () => {
    render(<Probe />);
    expect(screen.getByText("runner ok")).toBeInTheDocument();
  });
});
