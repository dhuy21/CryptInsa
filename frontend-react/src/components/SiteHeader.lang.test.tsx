import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LanguageProvider } from "../i18n/LanguageContext";
import SiteHeader from "./SiteHeader";

function renderHeader() {
  render(
    <MemoryRouter>
      <LanguageProvider>
        <SiteHeader />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("language switch", () => {
  it("starts in French, then follows EN and FR", () => {
    renderHeader();

    expect(screen.getByText("Cryptanalyse")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Aide" })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("fr");

    fireEvent.click(screen.getByRole("button", { name: "EN" }));

    expect(screen.getByText("Cryptanalysis")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Help" })).toBeInTheDocument();
    expect(screen.queryByText("Cryptanalyse")).not.toBeInTheDocument();
    expect(document.documentElement.lang).toBe("en");
    expect(localStorage.getItem("lang")).toBe("en");

    fireEvent.click(screen.getByRole("button", { name: "FR" }));

    expect(screen.getByText("Cryptanalyse")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Aide" })).toBeInTheDocument();
    expect(document.documentElement.lang).toBe("fr");
    expect(localStorage.getItem("lang")).toBe("fr");
  });
});
