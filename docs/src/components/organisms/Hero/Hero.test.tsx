import { readFileSync } from "node:fs";
import { render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { heroTitle, type Language, translator } from "../../../i18n";
import { buildTimeline, toCssVariables } from "../../../lib/sequence";
import { Hero } from "./Hero";

const DOWNLOADS = { mac: "https://example.com/pipecut-arm64.dmg", windows: "https://example.com/pipecut-x64.exe" };

function renderHero(language: Language = "fr") {
  const t = translator(language);
  const title = heroTitle(t);
  const timeline = buildTimeline(title);
  const view = render(
    <Hero
      title={title}
      tagline={[t("hero.tagline.promise"), t("hero.tagline.how")]}
      timeline={timeline}
      downloadId="telecharger"
      downloads={[
        { label: t("hero.downloadMac"), href: DOWNLOADS.mac },
        { label: t("hero.downloadWindows"), href: DOWNLOADS.windows },
      ]}
      free={t("hero.free")}
      requirements={t("hero.requirements")}
      video={{ label: t("hero.watchVideo"), href: "#video" }}
    />
  );
  const section = view.container.querySelector<HTMLElement>("[data-sequence]");
  if (!section) {
    throw new Error("le haut de page n'a pas de section [data-sequence]");
  }
  return { ...view, section, timeline };
}

describe("Hero : contenu", () => {
  it("affiche le titre, l'accroche, les boutons, les mentions et le lien vidéo", () => {
    renderHero();

    expect(screen.getByRole("heading", { level: 1, name: "Télécharge. Découpe. Sous-titre." })).toBeInTheDocument();
    expect(screen.getByText("Le bon extrait, au bon format, prêt à poster.")).toBeInTheDocument();
    expect(screen.getByText("Colle un lien, PipeCut s'occupe du reste.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Télécharger pour Mac" })).toHaveAttribute("href", DOWNLOADS.mac);
    expect(screen.getByRole("link", { name: "Télécharger pour Windows" })).toHaveAttribute("href", DOWNLOADS.windows);
    expect(screen.getByText("Gratuit · Sans compte")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Voir PipeCut en une minute" })).toHaveAttribute("href", "#video");
  });

  it("place le logo animé avant le titre", () => {
    const { container } = renderHero();
    const logo = container.querySelector("[data-animated-logo]");
    const heading = screen.getByRole("heading", { level: 1 });

    expect(logo).not.toBeNull();
    expect(logo?.compareDocumentPosition(heading)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });
});

describe("Hero : séquence", () => {
  it("pose les délais calculés par lib/sequence en variables CSS sur la section", () => {
    const { section, timeline } = renderHero();

    for (const [name, value] of Object.entries(toCssVariables(timeline))) {
      expect(section.style.getPropertyValue(name), name).toBe(value);
    }
    expect(section.style.getPropertyValue("--seq-fill-at")).toBe("0.6s");
    expect(section.style.getPropertyValue("--seq-cut-at")).toBe("1.9s");
    expect(section.style.getPropertyValue("--seq-type-at")).toBe("2.35s");
  });

  it("place le logo, le titre et le reste du contenu sous cette même section", () => {
    const { section } = renderHero();

    expect(section.querySelector("[data-animated-logo]")).not.toBeNull();
    expect(section.querySelector("[data-fill-text]")).toHaveTextContent("Télécharge.");
    expect(section.querySelector("[data-cut-text]")).not.toBeNull();
    expect(section.querySelector("[data-typed-subtitle]")).not.toBeNull();
  });

  it("numérote chaque lettre du troisième mot, pour décaler son apparition d'un pas", () => {
    const { section } = renderHero();
    const ranks = Array.from(section.querySelectorAll<HTMLElement>("[data-character]"), (character) =>
      character.style.getPropertyValue("--i")
    );

    expect(ranks).toEqual(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "10"]);
  });

  it("fait apparaître ensemble l'accroche, les boutons, les mentions et le lien vidéo", () => {
    const { section } = renderHero();
    const content = section.querySelector<HTMLElement>("[data-sequence-content]");
    if (!content) {
      throw new Error("le haut de page n'a pas de bloc [data-sequence-content]");
    }

    expect(within(content).getByText("Le bon extrait, au bon format, prêt à poster.")).toBeInTheDocument();
    expect(within(content).getAllByRole("link")).toHaveLength(3);
    expect(within(content).getByText("Gratuit · Sans compte")).toBeInTheDocument();
    // le titre et le logo ont leurs propres animations
    expect(within(content).queryByRole("heading")).toBeNull();
    expect(content.querySelector("[data-animated-logo]")).toBeNull();
  });

  it("recalcule la séquence pour une autre langue", () => {
    const { section } = renderHero("en");

    expect(screen.getByRole("heading", { level: 1, name: "Download. Cut. Caption." })).toBeInTheDocument();
    expect(section.querySelectorAll("[data-character]")).toHaveLength(8);
    expect(section.style.getPropertyValue("--seq-type-at")).toBe("2.35s");
  });
});

// Feuilles de style de tous les composants, lues telles quelles sur le disque
const STYLESHEETS = Object.fromEntries(
  Object.keys(import.meta.glob("../../**/*.module.css")).map((path) => [
    path,
    readFileSync(new URL(path, import.meta.url), "utf8"),
  ])
);

/** Sépare une feuille de style en deux : le bloc « mouvement réduit », et tout le reste. */
function splitReducedMotion(css: string) {
  const start = css.indexOf("@media (prefers-reduced-motion: reduce)");
  if (start === -1) {
    return { reduced: "", rest: css };
  }
  let depth = 0;
  let end = css.indexOf("{", start);
  do {
    if (css[end] === "{") depth += 1;
    if (css[end] === "}") depth -= 1;
    end += 1;
  } while (depth > 0);
  return { reduced: css.slice(start, end), rest: css.slice(0, start) + css.slice(end) };
}

/** Classes qui déclarent une animation, hors du bloc « mouvement réduit ». */
function animatedClasses(css: string): string[] {
  const classes: string[] = [];
  for (const [, selector = "", body = ""] of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    if (/\banimation\s*:/.test(body)) {
      classes.push(...(selector.match(/\.[\w-]+/g) ?? []));
    }
  }
  return classes;
}

/** Styles de base d'un composant : sa feuille de style sans le bloc « mouvement réduit » ni les animations. */
function base(name: string): string {
  const sheet = Object.entries(STYLESHEETS).find(([path]) => path.endsWith(`/${name}.module.css`));
  return splitReducedMotion(sheet?.[1] ?? "").rest.replace(/@keyframes[^{]+\{(?:[^{}]*\{[^{}]*\})*[^{}]*\}/g, "");
}

describe("Hero : mouvement réduit", () => {
  const animated = Object.entries(STYLESHEETS)
    .map(([path, css]) => ({ path, ...splitReducedMotion(css) }))
    .map((sheet) => ({ ...sheet, classes: animatedClasses(sheet.rest) }))
    .filter((sheet) => sheet.classes.length > 0);

  it("trouve les feuilles de style animées : le haut de page, et les menus du header", () => {
    const names = animated.map((sheet) => sheet.path.split("/").at(-1));

    expect(names.toSorted()).toEqual([
      "AnimatedLogo.module.css",
      "CutText.module.css",
      "FillText.module.css",
      "Hero.module.css",
      "Popover.module.css",
      "TypedSubtitle.module.css",
    ]);
  });

  it.each(animated)("$path coupe toutes ses animations en mouvement réduit", ({ reduced, classes }) => {
    expect(reduced).toContain("@media (prefers-reduced-motion: reduce)");
    expect(reduced).toMatch(/animation:\s*none/);
    // chaque élément animé est couvert : sans animation, ses styles de base sont l'état final
    for (const className of classes) {
      expect(reduced, className).toContain(className);
    }
  });

  it("affiche l'état final sans animation : mot rempli, mot coupé, lettres et bandeau visibles", () => {
    // « Télécharge. » entièrement vert
    expect(base("FillText")).toMatch(/background-size:\s*100% 100%/);
    // « Découpe. » déjà coupé, moitié haute décalée
    expect(base("CutText")).toMatch(/\.top\s*\{[^}]*transform:\s*translate\(0\.06em, -0\.045em\) rotate\(-1deg\)/);
    expect(base("CutText")).toMatch(/\.bottom\s*\{[^}]*clip-path:\s*polygon\(-10% 66\.4%/);
    // grand triangle blanc du logo masqué
    expect(base("AnimatedLogo")).toMatch(/\.whole\s*\{[^}]*opacity:\s*0/);
    // aucune opacité nulle ailleurs : le bandeau, les lettres et le contenu sont visibles
    expect(base("TypedSubtitle")).not.toMatch(/opacity/);
    expect(base("Hero")).not.toMatch(/opacity/);
  });
});

describe("Hero : fin des animations", () => {
  // Une animation qui garde sa dernière image (`both`, `forwards`) laisse pour toujours sa
  // transformation ou son filtre sur l'élément, même sans effet visible : il reste alors sur sa propre
  // couche de rendu. Les styles de base sont déjà l'état final : `backwards` suffit. Seule la sortie
  // des panneaux garde sa dernière image, le temps qu'ils quittent la page.
  it.each(Object.entries(STYLESHEETS))("%s ne garde pas la dernière image de ses animations", (path, css) => {
    const declarations = css.replace(/\/\*[\s\S]*?\*\//g, "");
    const kept = declarations.match(/^.*\b(?:both|forwards)\b.*$/gm) ?? [];

    expect(kept.map((line) => line.trim())).toEqual(
      path.endsWith("/Popover.module.css") ? ["animation: popover-out 0.15s ease-in forwards;"] : []
    );
  });
});

describe("Hero : paliers des animations", () => {
  // Un palier step-end n'est franchi qu'à une progression de exactement 1. En fin d'animation, le
  // navigateur s'arrête parfois à 0,9999999 (arrondi du délai + durée) : l'élément garderait alors
  // son état de départ pour toujours. C'est arrivé au grand triangle du logo, resté affiché après
  // la coupe. step-start franchit le palier dès le début et n'a pas ce défaut.
  it.each(Object.entries(STYLESHEETS))("%s n'utilise pas step-end", (_path, css) => {
    // les commentaires peuvent citer step-end : seules les déclarations comptent
    const declarations = css.replace(/\/\*[\s\S]*?\*\//g, "");

    expect(declarations).not.toMatch(/step-end|jump-end|steps\(\s*\d+\s*\)|steps\(\s*\d+\s*,\s*end\s*\)/);
  });
});
