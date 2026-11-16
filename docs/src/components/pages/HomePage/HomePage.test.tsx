import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { heroTitle, type Language, LANGUAGES, translator } from "../../../i18n";
import { buildTimeline } from "../../../lib/sequence";
import { HomePage } from "./HomePage";

function renderHomePage(language: Language = "fr") {
  const t = translator(language);
  return render(
    <HomePage
      language={language}
      t={t}
      timeline={buildTimeline(heroTitle(t))}
      share={<button type="button">Partager</button>}
      download={<button type="button">Télécharger</button>}
    />
  );
}

describe("HomePage", () => {
  it("assemble le header, le haut de page et le pied de page", () => {
    renderHomePage();
    const header = screen.getByRole("banner");
    const main = screen.getByRole("main");
    const footer = screen.getByRole("contentinfo");

    expect(within(header).getByRole("button", { name: "Partager" })).toBeInTheDocument();
    expect(within(header).getByRole("button", { name: "Télécharger" })).toBeInTheDocument();
    expect(within(main).getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(header.compareDocumentPosition(main)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(main.compareDocumentPosition(footer)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

  it("pose l'ancre « telecharger » sur les boutons de téléchargement du haut de page", () => {
    const { container } = renderHomePage();
    const target = container.querySelector("#telecharger");

    expect(target).not.toBeNull();
    expect(within(target as HTMLElement).getAllByRole("link")).toHaveLength(2);
  });

  it("propose de vrais liens vers les fichiers d'installation", () => {
    renderHomePage();

    for (const name of ["Télécharger pour Mac", "Télécharger pour Windows"]) {
      expect(screen.getByRole("link", { name }).getAttribute("href")).toMatch(/^https:\/\//);
    }
  });

  it("propose toutes les langues du site dans le pied de page, la sienne signalée", () => {
    renderHomePage("de");
    const languages = within(screen.getByRole("navigation", { name: "Sprache" })).getAllByRole("link");

    expect(languages).toHaveLength(LANGUAGES.length);
    expect(languages.map((link) => link.getAttribute("href"))).toEqual([
      "/fr/",
      "/en/",
      "/en-gb/",
      "/es/",
      "/de/",
      "/it/",
      "/pt-br/",
      "/pt-pt/",
    ]);
    expect(screen.getByRole("link", { name: "Deutsch" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Français" })).not.toHaveAttribute("aria-current");
  });

  it.each(LANGUAGES)("affiche la page en « %s » avec ses propres textes", (language) => {
    renderHomePage(language);
    const t = translator(language);
    const title = heroTitle(t);

    expect(
      screen.getByRole("heading", { level: 1, name: `${title.download} ${title.cut} ${title.subtitle}` })
    ).toBeInTheDocument();
    expect(screen.getByText(t("hero.tagline.promise"))).toBeInTheDocument();
    expect(screen.getByRole("link", { name: t("hero.downloadMac") })).toBeInTheDocument();
  });
});
