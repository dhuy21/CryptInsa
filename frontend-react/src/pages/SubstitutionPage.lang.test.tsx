import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import SiteHeader from "../components/SiteHeader";
import { LanguageProvider } from "../i18n/LanguageContext";
import SubstitutionPage from "./SubstitutionPage";

function renderSubstitution() {
  render(
    <MemoryRouter>
      <LanguageProvider>
        <SiteHeader />
        <SubstitutionPage />
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

describe("Substitution language", () => {
  it("stays in French when the site language switches to English", () => {
    renderSubstitution();

    expect(screen.getByRole("heading", { name: "Chiffrement par Substitution" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Table de Substitution" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aléatoire" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Texte à chiffrer" })).toBeInTheDocument();
    expect(document.title).toBe("Illustration du chiffrement par substitution");

    fireEvent.click(screen.getByRole("button", { name: "EN" }));

    expect(screen.getByText("Cryptanalysis")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Chiffrement par Substitution" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Table de Substitution" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Aléatoire" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Identité" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Inversé" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Atbash" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Texte à chiffrer" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Texte chiffré" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Déchiffrer par attaque" })).toBeInTheDocument();
    expect(document.title).toBe("Illustration du chiffrement par substitution");
  });
});
