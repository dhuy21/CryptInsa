import { cleanup, fireEvent, render, screen } from "@testing-library/react";
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

describe("sidebar toggle", () => {
  it("opens on the first click and closes on the second", () => {
    renderSidebar();

    const sidebar = document.getElementById("sidebar");
    expect(sidebar).not.toHaveClass("active");
    fireEvent.click(screen.getByRole("button", { name: "Ouvrir le menu", expanded: false }));

    expect(sidebar).toHaveClass("active");
    fireEvent.click(screen.getByRole("button", { name: "Fermer", expanded: true }));

    expect(sidebar).not.toHaveClass("active");
    expect(screen.getByRole("button", { name: "Ouvrir le menu", expanded: false })).toBeInTheDocument();
  });
});
