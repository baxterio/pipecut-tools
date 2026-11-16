import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LanguageNav } from "./LanguageNav";

const LANGUAGES = [
  { code: "fr", name: "Français", href: "/fr/" },
  { code: "en-GB", name: "English (UK)", href: "/en-gb/" },
  { code: "de", name: "Deutsch", href: "/de/" },
];

describe("LanguageNav", () => {
  it("est une navigation nommée par son titre, avec une icône décorative", () => {
    render(<LanguageNav label="Langue" languages={LANGUAGES} />);
    const nav = screen.getByRole("navigation", { name: "Langue" });

    expect(nav.querySelector("svg")).toHaveAttribute("data-icon", "globe");
    expect(nav.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
  });

  it("propose un vrai lien par langue, dans l'ordre reçu", () => {
    render(<LanguageNav label="Langue" languages={LANGUAGES} />);
    const links = within(screen.getByRole("list")).getAllByRole("link");

    expect(links.map((link) => link.textContent)).toEqual(["Français", "English (UK)", "Deutsch"]);
    expect(links.map((link) => link.getAttribute("href"))).toEqual(["/fr/", "/en-gb/", "/de/"]);
  });

  it("indique la langue de chaque lien, pour que son nom soit lu dans cette langue", () => {
    render(<LanguageNav label="Langue" languages={LANGUAGES} />);
    const english = screen.getByRole("link", { name: "English (UK)" });

    expect(english).toHaveAttribute("lang", "en-GB");
    expect(english).toHaveAttribute("hreflang", "en-GB");
  });

  it("signale la langue de la page, et elle seule", () => {
    render(<LanguageNav label="Langue" languages={LANGUAGES} current="de" />);

    expect(screen.getByRole("link", { name: "Deutsch" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Français" })).not.toHaveAttribute("aria-current");
  });

  it("ne signale aucune langue quand la page n'en a pas : la racine du site", () => {
    render(<LanguageNav label="Langue" languages={LANGUAGES} />);

    expect(document.querySelector("[aria-current]")).toBeNull();
  });
});
