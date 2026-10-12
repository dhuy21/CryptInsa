import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
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

function openMenu() {
  fireEvent.click(screen.getByRole("button", { name: "Ouvrir le menu", expanded: false }));
}

function expectClosed() {
  expect(document.getElementById("sidebar")).not.toHaveClass("active");
  expect(document.getElementById("sidebarOverlay")).not.toHaveClass("active");
  expect(screen.getByRole("button", { name: "Ouvrir le menu", expanded: false })).toBeInTheDocument();
}

beforeEach(() => {
  localStorage.clear();
});

afterEach(() => {
  cleanup();
  localStorage.clear();
});

describe("sidebar close paths", () => {
  it("closes from the X button", () => {
    renderSidebar();
    openMenu();

    const sidebar = document.getElementById("sidebar");
    expect(sidebar).toHaveClass("active");
    fireEvent.click(within(sidebar as HTMLElement).getByRole("button", { name: "Fermer" }));

    expectClosed();
  });

  it("closes from a click on the overlay", () => {
    renderSidebar();
    openMenu();

    fireEvent.click(document.getElementById("sidebarOverlay") as HTMLElement);

    expectClosed();
  });

  it("closes when Escape is pressed", () => {
    renderSidebar();
    openMenu();

    fireEvent.keyDown(document, { key: "Escape" });

    expectClosed();
  });
});
