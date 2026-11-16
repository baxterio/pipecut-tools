import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { languageLinks } from "../../../i18n";
import { LanguagePage } from "./LanguagePage";

describe("LanguagePage", () => {
  it("montre la marque, puis le choix de la langue", () => {
    render(<LanguagePage label="Langue" languages={languageLinks()} />);
    const main = screen.getByRole("main");
    const brand = within(main).getByText("PipeCut");
    const nav = within(main).getByRole("navigation", { name: "Langue" });

    expect(brand.querySelector("svg")).toHaveAttribute("aria-hidden", "true");
    expect(brand.compareDocumentPosition(nav)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("propose toutes les langues du site, sans en signaler aucune : la page n'a pas de langue", () => {
    render(<LanguagePage label="Langue" languages={languageLinks()} />);
    const links = screen.getAllByRole("link");

    expect(links.map((link) => link.getAttribute("href"))).toEqual(languageLinks().map((link) => link.href));
    expect(document.querySelector("[aria-current]")).toBeNull();
  });
});
