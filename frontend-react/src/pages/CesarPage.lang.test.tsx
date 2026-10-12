import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import SiteHeader from "../components/SiteHeader";
import { LanguageProvider } from "../i18n/LanguageContext";
import CesarPage from "./CesarPage";

function renderCesar() {
  render(
    <MemoryRouter>
      <LanguageProvider>
        <SiteHeader />
        <CesarPage />
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

describe("César language", () => {
  it("stays in French when the site language switches to English", () => {
    renderCesar();

    expect(screen.getByRole("heading", { name: "Outil de Chiffrement/Déchiffrement" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Roue de Chiffrement" })).toBeInTheDocument();
    expect(screen.getByText(/Décalage:/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Inverser" })).toBeInTheDocument();
    expect(document.title).toBe("Illustration du chiffrement de César");

    fireEvent.click(screen.getByRole("button", { name: "EN" }));

    expect(screen.getByText("Cryptanalysis")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Outil de Chiffrement/Déchiffrement" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Roue de Chiffrement" })).toBeInTheDocument();
    expect(screen.getByText(/Décalage:/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Inverser" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Exemples :" })).toBeInTheDocument();
    expect(document.title).toBe("Illustration du chiffrement de César");
  });
});
