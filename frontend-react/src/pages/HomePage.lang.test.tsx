import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import SiteHeader from "../components/SiteHeader";
import { LanguageProvider } from "../i18n/LanguageContext";
import HomePage from "./HomePage";

const frenchLead = "Découvrez les secrets cachés dans les textes chiffrés grâce à ce site. Un outil simple et puissant pour la cryptanalyse.";
const englishLead = "Discover the secrets hidden in ciphertext with this site. A simple and powerful tool for cryptanalysis.";

function renderHome() {
  render(
    <MemoryRouter>
      <LanguageProvider>
        <SiteHeader />
        <HomePage />
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

describe("home language", () => {
  it("starts in French and follows the EN and FR buttons", () => {
    renderHome();

    expect(screen.getByText(frenchLead)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Qu'est-ce que la cryptanalyse ?" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "En savoir plus" })).toBeInTheDocument();
    expect(document.title).toBe("CryptoAnalyzer - Analyse de Fréquence");

    fireEvent.click(screen.getByRole("button", { name: "EN" }));

    expect(screen.getByText(englishLead)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "What is cryptanalysis?" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Learn more" })).toBeInTheDocument();
    expect(screen.queryByText(frenchLead)).not.toBeInTheDocument();
    expect(document.title).toBe("CryptoAnalyzer - Frequency analysis");

    fireEvent.click(screen.getByRole("button", { name: "FR" }));

    expect(screen.getByText(frenchLead)).toBeInTheDocument();
    expect(document.title).toBe("CryptoAnalyzer - Analyse de Fréquence");
  });
});
