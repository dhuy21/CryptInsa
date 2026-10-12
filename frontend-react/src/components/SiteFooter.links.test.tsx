import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LanguageProvider } from "../i18n/LanguageContext";
import SiteFooter from "./SiteFooter";

function renderFooter() {
  render(
    <MemoryRouter>
      <LanguageProvider>
        <SiteFooter />
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

describe("footer tool links", () => {
  it("opens César and Substitution, not the attack pages", () => {
    renderFooter();

    expect(screen.getByRole("link", { name: "Chiffre César" })).toHaveAttribute("href", "/cesar");
    expect(screen.getByRole("link", { name: "Substitution" })).toHaveAttribute("href", "/substitution");

    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(hrefs).not.toContain("/substitution_attaque");
    expect(hrefs).not.toContain("/substitution_annalyse");
    expect(hrefs).not.toContain("/substitution_dechiffre");
  });
});
