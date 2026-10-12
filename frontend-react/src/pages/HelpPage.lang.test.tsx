import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import SiteHeader from "../components/SiteHeader";
import { LanguageProvider } from "../i18n/LanguageContext";
import HelpPage from "./HelpPage";

function renderHelp() {
  render(
    <MemoryRouter>
      <LanguageProvider>
        <SiteHeader />
        <HelpPage />
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

describe("help language", () => {
  it("translates the guide and keeps the French tool labels in English", () => {
    renderHelp();

    expect(screen.getByRole("heading", { name: "Guide d'utilisation - CryptInsa" })).toBeInTheDocument();
    expect(screen.getByText("Ouvrez la page Chiffre César")).toBeInTheDocument();
    expect(document.title).toBe("Aide - CryptInsa");

    fireEvent.click(screen.getByRole("button", { name: "EN" }));

    expect(screen.getByRole("heading", { name: "User guide - CryptInsa" })).toBeInTheDocument();
    expect(screen.queryByText("Ouvrez la page Chiffre César")).not.toBeInTheDocument();
    expect(screen.getByText("Open Chiffre César")).toBeInTheDocument();
    expect(screen.getByText("Set Décalage from 0 to 28")).toBeInTheDocument();
    expect(screen.getByText("Read the result under Chiffré")).toBeInTheDocument();
    expect(screen.getByText("Inverser swaps the two boxes")).toBeInTheDocument();
    expect(screen.getByText("Type in Texte à chiffrer")).toBeInTheDocument();
    expect(screen.getByText("Press LANCER L'ATTAQUE when the text has at least 50 characters")).toBeInTheDocument();
    expect(document.title).toBe("Help - CryptInsa");

    fireEvent.click(screen.getByRole("button", { name: "FR" }));

    expect(screen.getByRole("heading", { name: "Guide d'utilisation - CryptInsa" })).toBeInTheDocument();
    expect(screen.getByText("Ouvrez la page Chiffre César")).toBeInTheDocument();
    expect(document.title).toBe("Aide - CryptInsa");
  });
});
