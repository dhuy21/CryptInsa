import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import SiteHeader from "../components/SiteHeader";
import { LanguageProvider } from "../i18n/LanguageContext";
import SubstitutionAttackPage from "./SubstitutionAttackPage";

function renderAttack() {
  render(
    <MemoryRouter>
      <LanguageProvider>
        <SiteHeader />
        <SubstitutionAttackPage />
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

describe("attack language", () => {
  it("stays in French when the site language switches to English", () => {
    renderAttack();

    expect(screen.getByRole("heading", { name: "Attaque par Substitution" })).toBeInTheDocument();
    expect(screen.getByLabelText("Texte Chiffré")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /TEXTE TROP COURT/ })).toBeInTheDocument();
    expect(document.title).toBe("Attaque par substitution");

    fireEvent.click(screen.getByRole("button", { name: "EN" }));

    expect(screen.getByRole("link", { name: "Help" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Attaque par Substitution" })).toBeInTheDocument();
    expect(screen.getByLabelText("Texte Chiffré")).toBeInTheDocument();
    expect(screen.getByText(/Caractères:/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /TEXTE TROP COURT/ })).toBeInTheDocument();
    expect(document.title).toBe("Attaque par substitution");

    fireEvent.change(screen.getByLabelText("Texte Chiffré"), { target: { value: "A".repeat(50) } });

    expect(screen.getByRole("button", { name: /LANCER L'ATTAQUE/ })).toBeInTheDocument();
    expect(screen.getByText("Analyse de Fréquences")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /TEXTE TROP COURT/ })).not.toBeInTheDocument();
  });
});
