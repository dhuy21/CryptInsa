import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import SiteHeader from "../components/SiteHeader";
import { LanguageProvider } from "../i18n/LanguageContext";
import AboutPage from "./AboutPage";

const frenchLead = "Découvrez notre équipe passionnée de cryptographie et l'histoire derrière CryptInsa, votre plateforme d'analyse cryptographique.";
const englishLead = "Meet the team behind CryptInsa, a platform for learning cryptanalysis.";

function renderAbout() {
  render(
    <MemoryRouter>
      <LanguageProvider>
        <SiteHeader />
        <AboutPage />
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

describe("about language", () => {
  it("starts in French and follows the EN and FR buttons", () => {
    renderAbout();

    expect(screen.getByText(frenchLead)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Notre Projet" })).toBeInTheDocument();
    expect(screen.getByText("Chef de Projet")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Essayer les outils" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "BARBIER Ted" })).toBeInTheDocument();
    expect(document.title).toBe("À propos de nous");

    fireEvent.click(screen.getByRole("button", { name: "EN" }));

    expect(screen.getByText(englishLead)).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Our project" })).toBeInTheDocument();
    expect(screen.getByText("Project lead")).toBeInTheDocument();
    expect(screen.queryByText("Chef de Projet")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Try the tools" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "BARBIER Ted" })).toBeInTheDocument();
    expect(document.title).toBe("About us");

    fireEvent.click(screen.getByRole("button", { name: "FR" }));

    expect(screen.getByText(frenchLead)).toBeInTheDocument();
    expect(screen.getByText("Chef de Projet")).toBeInTheDocument();
    expect(document.title).toBe("À propos de nous");
  });
});
