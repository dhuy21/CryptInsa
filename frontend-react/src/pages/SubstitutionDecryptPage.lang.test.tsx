import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SiteHeader from "../components/SiteHeader";
import { LanguageProvider } from "../i18n/LanguageContext";
import SubstitutionDecryptPage from "./SubstitutionDecryptPage";

function renderDecrypt() {
  render(
    <MemoryRouter>
      <LanguageProvider>
        <SiteHeader />
        <SubstitutionDecryptPage />
      </LanguageProvider>
    </MemoryRouter>,
  );
}

beforeEach(() => {
  localStorage.clear();
  vi.useFakeTimers();
});

afterEach(() => {
  cleanup();
  vi.clearAllTimers();
  vi.useRealTimers();
  localStorage.clear();
});

describe("decrypt language", () => {
  it("stays in French when the site language switches to English", () => {
    renderDecrypt();

    expect(screen.getByRole("heading", { name: "Déchiffrement par attaque" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Commencer" })).toBeInTheDocument();
    expect(screen.getByText("Aucun texte chiffré trouvé. Utilisez d'abord la page d'attaque.")).toBeInTheDocument();
    expect(document.title).toBe("Déchiffrement par substitution");

    fireEvent.click(screen.getByRole("button", { name: "EN" }));

    expect(screen.getByText("Cryptanalysis")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Déchiffrement par attaque" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Texte Chiffré Original:" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Texte en Clair Original:" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mot chiffré" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Mot traduit" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Texte Déchiffré (Résultat):" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Commencer" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Copier" })).toBeInTheDocument();
    expect(screen.getByText("Aucun texte chiffré trouvé. Utilisez d'abord la page d'attaque.")).toBeInTheDocument();
    expect(document.title).toBe("Déchiffrement par substitution");
  });
});
