import { cleanup, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { LanguageProvider } from "../i18n/LanguageContext";
import SiteSidebar from "./SiteSidebar";

function renderSidebar() {
  render(
    <MemoryRouter>
      <LanguageProvider>
        <SiteSidebar />
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

describe("sidebar destinations", () => {
  it("opens the section pages, not the attack pages", () => {
    renderSidebar();

    expect(screen.getByRole("link", { name: "Accueil" })).toHaveAttribute("href", "/");
    expect(screen.getByRole("link", { name: "Notre Équipe" })).toHaveAttribute("href", "/about_us");
    expect(screen.getByRole("link", { name: "Chiffre César" })).toHaveAttribute("href", "/cesar");
    expect(screen.getByRole("link", { name: "Substitution" })).toHaveAttribute("href", "/substitution");
    expect(screen.getByRole("link", { name: "Aide" })).toHaveAttribute("href", "/help");

    const hrefs = screen.getAllByRole("link").map((link) => link.getAttribute("href"));
    expect(hrefs).not.toContain("/substitution_attaque");
    expect(hrefs).not.toContain("/substitution_annalyse");
    expect(hrefs).not.toContain("/substitution_dechiffre");
  });
});
