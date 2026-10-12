import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import SiteHeader from "../components/SiteHeader";
import { LanguageProvider } from "../i18n/LanguageContext";
import SubstitutionAnalysePage from "./SubstitutionAnalysePage";

vi.mock("../api/frequencies", () => ({
  frenchFrequencies: () => new Promise(() => undefined),
}));

function renderAnalyse() {
  render(
    <MemoryRouter>
      <LanguageProvider>
        <SiteHeader />
        <SubstitutionAnalysePage />
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

describe("analyse language", () => {
  it("stays in French when the site language switches to English", () => {
    renderAnalyse();

    expect(screen.getByRole("heading", { name: "Analyse de Fréquences" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Fréquences du Texte Chiffré" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Actualiser" })).toBeInTheDocument();
    expect(document.title).toBe("Analyse de fréquence");

    fireEvent.click(screen.getByRole("button", { name: "EN" }));

    expect(screen.getByText("Cryptanalysis")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Analyse de Fréquences" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Fréquences du Texte Chiffré" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Comparaison Française" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Correspondances Suggérées" })).toBeInTheDocument();
    expect(screen.getByText("Aucun texte chiffré analysé")).toBeInTheDocument();
    expect(screen.getByText("En attente du texte chiffré...")).toBeInTheDocument();
    expect(screen.getByText("FRÉQUENCES FRANÇAISES")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Actualiser" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Étape suivante" })).toBeInTheDocument();
    expect(document.title).toBe("Analyse de fréquence");
  });
});
