// @vitest-environment node
import { describe, expect, it } from "vitest";

/** Niveaux de l'atomic design, du plus bas au plus haut. */
const LEVELS = ["atoms", "molecules", "organisms", "pages"] as const;

const SOURCES = import.meta.glob<string>("../components/**/*.{ts,tsx}", {
  query: "?raw",
  import: "default",
  eager: true,
});
const STYLES = Object.keys(import.meta.glob("../components/**/*.module.css"));

function levelOf(path: string): number {
  return LEVELS.findIndex((level) => path.includes(`/components/${level}/`));
}

/** Chemins importés par un fichier, résolus par rapport à lui. */
function importsOf(path: string, source: string): string[] {
  const specifiers = Array.from(source.matchAll(/from\s+"(\.[^"]+)"/g), (match) => match[1] ?? "");
  return specifiers.map((specifier) => new URL(specifier, `file:///src/test/${path}`).pathname);
}

describe("architecture atomique", () => {
  it("range chaque composant dans un des quatre niveaux", () => {
    for (const path of Object.keys(SOURCES)) {
      expect(levelOf(path), path).toBeGreaterThanOrEqual(0);
    }
  });

  it("n'importe jamais un niveau supérieur : un atome n'importe pas de molécule, etc.", () => {
    const violations: string[] = [];
    for (const [path, source] of Object.entries(SOURCES)) {
      for (const imported of importsOf(path, source)) {
        if (levelOf(imported) > levelOf(path)) {
          violations.push(`${path} importe ${imported}`);
        }
      }
    }

    expect(violations).toEqual([]);
  });

  it("donne à chaque composant son dossier : composant, styles, test et index", () => {
    const folders = new Set(Object.keys(SOURCES).map((path) => path.slice(0, path.lastIndexOf("/"))));

    // le filtre trouve bien des composants : sans cela, les contrôles ci-dessous ne vérifieraient rien
    expect(folders.size).toBeGreaterThan(0);
    for (const folder of folders) {
      const name = folder.slice(folder.lastIndexOf("/") + 1);
      expect(SOURCES, folder).toHaveProperty([`${folder}/${name}.tsx`]);
      expect(SOURCES, folder).toHaveProperty([`${folder}/${name}.test.tsx`]);
      expect(SOURCES, folder).toHaveProperty([`${folder}/index.ts`]);
    }
    // seule HomePage n'a pas de styles : elle ne fait qu'assembler des organismes
    const unstyled = [...folders].filter((folder) => {
      const name = folder.slice(folder.lastIndexOf("/") + 1);
      return !STYLES.includes(`${folder}/${name}.module.css`);
    });
    expect(unstyled).toEqual(["../components/pages/HomePage"]);
  });
});
