import { describe, expect, it } from "vitest";
import { appVersion, DOWNLOAD_URLS, languageUrl, ogImagePath, ogImageUrl, ROOT_URL, shareUrl } from "./site";

// Ces adresses sont un contrat avec la publication de l'app : elle dépose ses fichiers dans une release
// de pipecut-tools, sous ces noms. Les changer ici sans les changer là-bas casse les boutons du site.
describe("liens de téléchargement", () => {
  it("mène au .dmg de la dernière release de l'app", () => {
    expect(DOWNLOAD_URLS.mac).toBe(
      "https://github.com/baxterio/pipecut-tools/releases/latest/download/pipecut-arm64.dmg"
    );
  });

  it("mène à l'installeur Windows de la même release", () => {
    expect(DOWNLOAD_URLS.windows).toBe(
      "https://github.com/baxterio/pipecut-tools/releases/latest/download/pipecut-x64.exe"
    );
  });

  it("ne contient aucun numéro de version : les liens restent valables d'une version à l'autre", () => {
    for (const url of Object.values(DOWNLOAD_URLS)) {
      expect(url).not.toMatch(/\d+\.\d+/);
    }
  });
});

describe("numéro de version du menu Télécharger", () => {
  it("accepte un numéro seul ou le tag d'une release", () => {
    expect(appVersion("1.4.0")).toBe("1.4.0");
    expect(appVersion("v1.4.0")).toBe("1.4.0");
    expect(appVersion("pipecut-1.4.0")).toBe("1.4.0");
    expect(appVersion(" 2.0 ")).toBe("2.0");
  });

  it("ne donne rien sans numéro reconnaissable : le menu n'affiche alors pas de version", () => {
    expect(appVersion(undefined)).toBeUndefined();
    expect(appVersion("")).toBeUndefined();
    expect(appVersion("latest")).toBeUndefined();
  });
});

describe("adresses des langues", () => {
  it("donne à chaque langue sa page, en minuscules", () => {
    expect(languageUrl("fr")).toBe("https://pipecut.app/fr/");
    expect(languageUrl("en-GB")).toBe("https://pipecut.app/en-gb/");
    expect(languageUrl("pt-BR")).toBe("https://pipecut.app/pt-br/");
  });

  it("partage la racine du site en français, dont elle porte l'aperçu, et la page de la langue sinon", () => {
    expect(shareUrl("fr")).toBe("https://pipecut.app");
    expect(shareUrl("en")).toBe("https://pipecut.app/en/");
    expect(shareUrl("pt-PT")).toBe("https://pipecut.app/pt-pt/");
    expect(ROOT_URL).toBe("https://pipecut.app/");
  });

  it("range l'image d'aperçu de chaque langue sous son adresse", () => {
    expect(ogImagePath("de")).toBe("/og/de.png");
    expect(ogImageUrl("en-GB")).toBe("https://pipecut.app/og/en-gb.png");
  });
});
