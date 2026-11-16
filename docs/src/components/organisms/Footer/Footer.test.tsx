import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Footer } from "./Footer";

const LANGUAGES = [
  { code: "fr", name: "Français", href: "/fr/" },
  { code: "en", name: "English (US)", href: "/en/" },
];

describe("Footer", () => {
  it("est le pied de page, et propose le choix de la langue", () => {
    render(<Footer languagesLabel="Langue" languages={LANGUAGES} current="fr" />);
    const footer = screen.getByRole("contentinfo");
    const links = within(within(footer).getByRole("navigation", { name: "Langue" })).getAllByRole("link");

    expect(links.map((link) => link.textContent)).toEqual(["Français", "English (US)"]);
    expect(links[0]).toHaveAttribute("aria-current", "page");
  });
});
