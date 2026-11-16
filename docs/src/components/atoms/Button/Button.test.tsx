import { readFileSync } from "node:fs";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { Button } from "./Button";

// La feuille de style, lue telle quelle sur le disque. Son chemin passe par une constante : écrit en
// dur dans new URL(), Vite le prendrait pour une ressource à servir.
const STYLESHEET_PATH = "./Button.module.css";
const stylesheet = readFileSync(new URL(STYLESHEET_PATH, import.meta.url), "utf8");

describe("Button", () => {
  it("est un vrai lien quand il reçoit une adresse", () => {
    render(<Button href="#telecharger">Télécharger</Button>);

    expect(screen.getByRole("link", { name: "Télécharger" })).toHaveAttribute("href", "#telecharger");
    expect(screen.queryByRole("button")).toBeNull();
  });

  it("est un bouton d'action sans adresse", async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Partager</Button>);

    const button = screen.getByRole("button", { name: "Partager" });
    expect(button).toHaveAttribute("type", "button");
    await userEvent.click(button);
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("transmet les attributs d'accessibilité", () => {
    render(
      <Button variant="ghost" aria-expanded={false} aria-controls="menu">
        Partager
      </Button>
    );

    const button = screen.getByRole("button", { name: "Partager" });
    expect(button).toHaveAttribute("aria-expanded", "false");
    expect(button).toHaveAttribute("aria-controls", "menu");
  });

  it("fait 36 px de haut dans le header, et 44 px sur écran tactile ou étroit", () => {
    expect(stylesheet).toMatch(/\.sm\s*\{[^}]*height:\s*36px/);
    expect(stylesheet).toMatch(
      /@media \(pointer: coarse\), \(max-width: 768px\)\s*\{\s*\.sm\s*\{\s*height:\s*var\(--touch-target\)/
    );
  });

  it("garde sa couleur de survol tant que le panneau qu'il commande est ouvert", () => {
    expect(stylesheet).toMatch(/\.accent:hover,\s*\.accent\[aria-expanded="true"\]/);
    expect(stylesheet).toMatch(/\.ghost:hover,\s*\.ghost\[aria-expanded="true"\]/);
  });
});
