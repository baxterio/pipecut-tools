// @vitest-environment node
import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { token } from "./tokens";

// La feuille de style, lue telle quelle sur le disque. Son chemin passe par une constante : écrit en
// dur dans new URL(), Vite le prendrait pour une ressource à servir.
const TOKENS_PATH = "../styles/tokens.css";
const stylesheet = readFileSync(new URL(TOKENS_PATH, import.meta.url), "utf8");

describe("token", () => {
  it("donne la valeur d'une variable, telle que la feuille de style la déclare", () => {
    expect(token("--color-bg")).toMatch(/^#[0-9a-f]{6}$/);
    expect(stylesheet).toContain(`--color-bg: ${token("--color-bg")};`);
    expect(token("--touch-target")).toBe("44px");
  });

  it("ne confond pas une variable avec une autre dont le nom la contient", () => {
    expect(token("--color-text")).not.toBe(token("--color-text-secondary"));
    expect(stylesheet).toContain(`--color-text: ${token("--color-text")};`);
  });

  it("refuse une variable que la feuille ne déclare pas", () => {
    expect(() => token("--color-absente")).toThrow("tokens.css ne définit pas --color-absente");
  });

  it("refuse une variable qui renvoie à une autre : le HTML ne saurait pas la lire", () => {
    expect(() => token("--color-accent-glow")).toThrow("renvoie à une autre variable");
  });
});
