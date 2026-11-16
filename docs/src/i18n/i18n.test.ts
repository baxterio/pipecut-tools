// @vitest-environment node
import { existsSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { ogImagePath } from "../lib/site";
import {
  detectLanguage,
  FALLBACK_LANGUAGE,
  heroTitle,
  LANGUAGE_NAMES,
  LANGUAGES,
  languageFromPath,
  languageHref,
  languageLinks,
  languagePath,
  matchLanguage,
  REFERENCE_LANGUAGE,
  resources,
  rootRedirect,
  translator,
} from "./index";

type Tree = { [key: string]: string | Tree };

/** Chaque texte d'un fichier de langue, par clé complète (« hero.tagline.promise »). */
function leaves(tree: Tree, prefix = ""): Map<string, string> {
  const found = new Map<string, string>();
  for (const [key, value] of Object.entries(tree)) {
    if (typeof value === "string") {
      found.set(prefix + key, value);
    } else {
      for (const [sub, text] of leaves(value, `${prefix}${key}.`)) {
        found.set(sub, text);
      }
    }
  }
  return found;
}

/** Ce qu'une traduction doit garder de la langue de référence : variables et renvois. */
const markers = (text: string) => ({
  variables: [...text.matchAll(/\{\{\s*([^},\s]+)[^}]*\}\}/g)].map((match) => match[1]).toSorted(),
  references: [...text.matchAll(/\$t\(([^)]+)\)/g)].map((match) => match[1]).toSorted(),
});

describe("traductions", () => {
  const reference = leaves(resources[REFERENCE_LANGUAGE].translation);

  it("donne à chaque langue un fichier et un nom", () => {
    expect(Object.keys(resources).toSorted()).toEqual([...LANGUAGES].toSorted());
    expect(Object.keys(LANGUAGE_NAMES).toSorted()).toEqual([...LANGUAGES].toSorted());
  });

  it("propose les langues de l'app, dans le même ordre", () => {
    expect(LANGUAGES).toEqual(["fr", "en", "en-GB", "es", "de", "it", "pt-BR", "pt-PT"]);
  });

  it.each(LANGUAGES.filter((language) => language !== REFERENCE_LANGUAGE))(
    "« %s » a les mêmes clés que le français, avec ses variables et ses renvois",
    (language) => {
      const translated = leaves(resources[language].translation);

      expect([...translated.keys()]).toEqual([...reference.keys()]);
      for (const [key, text] of reference) {
        const other = translated.get(key) ?? "";
        expect(other.trim(), `${language} ${key} : texte vide`).not.toBe("");
        expect(markers(other), `${language} ${key}`).toEqual(markers(text));
      }
    }
  );

  it.each(LANGUAGES)("« %s » ne laisse ni renvoi ni variable non résolus dans ses textes", (language) => {
    const t = translator(language) as (key: string, values: Record<string, string>) => string;

    for (const key of reference.keys()) {
      const text = t(key, { version: "1.4.0" });
      expect(text, key).not.toMatch(/\$t\(|\{\{|\}\}/);
      expect(text, key).not.toBe(key);
    }
  });

  it("résout les renvois entre textes et les variables", () => {
    const t = translator("fr");

    expect(t("meta.description")).toBe(
      "Le bon extrait, au bon format, prêt à poster. Colle un lien, PipeCut s'occupe du reste. Gratuit, sans compte, pour Mac et Windows."
    );
    expect(t("meta.ogImageAlt")).toBe("PipeCut : Télécharge. Découpe. Sous-titre.");
    expect(t("download.freeWithVersion", { version: "1.4.0" })).toBe("Gratuit · Sans compte · v1.4.0");
    expect(translator("en")("download.freeWithVersion", { version: "1.4.0" })).toBe("Free · No account · v1.4.0");
  });

  it("distingue l'anglais du Royaume-Uni et le portugais du Portugal de leurs voisins", () => {
    expect(heroTitle(translator("en")).subtitle).toBe("Caption.");
    expect(heroTitle(translator("en-GB")).subtitle).toBe("Subtitle.");
    expect(translator("pt-BR")("header.download")).toBe("Baixar");
    expect(translator("pt-PT")("header.download")).toBe("Transferir");
  });

  it.each(LANGUAGES)("a une image d'aperçu de lien pour « %s » (pnpm og)", (language) => {
    expect(existsSync(new URL(`../../public${ogImagePath(language)}`, import.meta.url))).toBe(true);
  });
});

describe("langue du navigateur", () => {
  it("reconnaît une langue du site, quelle que soit sa région", () => {
    expect(matchLanguage("fr-CA")).toBe("fr");
    expect(matchLanguage("fr")).toBe("fr");
    expect(matchLanguage("es-419")).toBe("es");
    expect(matchLanguage("de-CH")).toBe("de");
    expect(matchLanguage("it_IT")).toBe("it");
  });

  it("sépare l'anglais britannique de l'américain, et le portugais d'Europe de celui du Brésil", () => {
    expect(matchLanguage("en-GB")).toBe("en-GB");
    expect(matchLanguage("en-AU")).toBe("en-GB");
    expect(matchLanguage("en-US")).toBe("en");
    expect(matchLanguage("en")).toBe("en");
    expect(matchLanguage("pt-PT")).toBe("pt-PT");
    expect(matchLanguage("pt-AO")).toBe("pt-PT");
    expect(matchLanguage("pt")).toBe("pt-BR");
    expect(matchLanguage("pt-BR")).toBe("pt-BR");
  });

  it("ne reconnaît pas une langue absente du site, et prend sinon la première langue préférée connue", () => {
    expect(matchLanguage("nl-NL")).toBeNull();
    expect(matchLanguage("")).toBeNull();
    expect(detectLanguage(["nl-NL", "ca-ES", "es-ES", "fr-FR"])).toBe("es");
    expect(detectLanguage(["nl-NL", "ja-JP"])).toBeNull();
    expect(detectLanguage([])).toBeNull();
  });
});

describe("adresses des langues", () => {
  it("donne à chaque langue un segment d'adresse en minuscules, qui la désigne seule", () => {
    expect(LANGUAGES.map(languagePath)).toEqual(["fr", "en", "en-gb", "es", "de", "it", "pt-br", "pt-pt"]);
    for (const language of LANGUAGES) {
      expect(languageFromPath(languagePath(language))).toBe(language);
    }
    expect(languageHref("en-GB")).toBe("/en-gb/");
  });

  it("refuse un segment qui n'est pas une langue du site", () => {
    expect(languageFromPath("nl")).toBeNull();
    expect(languageFromPath("")).toBeNull();
    // l'adresse est en minuscules : le code de la langue n'est pas une adresse
    expect(languageFromPath("en-GB")).toBeNull();
  });

  it("liste le lien de chaque langue, sous son nom dans cette langue", () => {
    expect(languageLinks()).toHaveLength(LANGUAGES.length);
    expect(languageLinks()[2]).toEqual({ code: "en-GB", name: "English (UK)", href: "/en-gb/" });
  });

  it("envoie la racine du site vers la langue du navigateur, l'anglais à défaut", () => {
    expect(rootRedirect(["de-AT", "en-US"])).toBe("/de/");
    expect(rootRedirect(["pt-PT"])).toBe("/pt-pt/");
    expect(rootRedirect(["ja-JP", "fr-FR"])).toBe("/fr/");
    expect(rootRedirect(["ja-JP"])).toBe(languageHref(FALLBACK_LANGUAGE));
    expect(rootRedirect([])).toBe("/en/");
  });
});
