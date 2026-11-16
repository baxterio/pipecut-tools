/**
 * Langues du site : celles de l'app, dans le même ordre (liste de son écran de choix de la langue).
 * Une langue s'écrit ici comme dans les pages : « en » pour l'anglais des États-Unis, « en-GB » pour
 * celui du Royaume-Uni. Les textes vivent dans locales/<langue>.json.
 *
 * Ce module ne dépend de rien : la racine du site l'embarque dans le navigateur pour choisir la langue.
 */
export const LANGUAGES = ["fr", "en", "en-GB", "es", "de", "it", "pt-BR", "pt-PT"] as const;
export type Language = (typeof LANGUAGES)[number];

/** Le nom de chaque langue, écrit dans cette langue : on reconnaît la sienne quelle que soit celle affichée. */
export const LANGUAGE_NAMES: Record<Language, string> = {
  fr: "Français",
  en: "English (US)",
  "en-GB": "English (UK)",
  es: "Español",
  de: "Deutsch",
  it: "Italiano",
  "pt-BR": "Português (Brasil)",
  "pt-PT": "Português (Portugal)",
};

/**
 * Langue de référence : les clés des textes sont typées sur son fichier, que les autres langues
 * suivent. La racine du site porte aussi ses balises d'aperçu de lien.
 */
export const REFERENCE_LANGUAGE: Language = "fr";

/** Langue servie quand aucune langue du navigateur n'est dans la liste. */
export const FALLBACK_LANGUAGE: Language = "en";

/** Régions dont l'anglais s'écrit à la britannique (colour, cancelled). */
const BRITISH_ENGLISH = new Set(["GB", "IE", "AU", "NZ", "IN", "ZA", "SG", "HK", "MT", "CY"]);
/** Régions du portugais d'Europe et d'Afrique ; ailleurs (et « pt » seul), celui du Brésil. */
const EUROPEAN_PORTUGUESE = new Set(["PT", "AO", "MZ", "CV", "GW", "ST", "TL", "MO", "GQ", "LU", "CH"]);

/**
 * La langue du site pour une langue du navigateur (« fr-CA » → fr, « en-AU » → en-GB, « pt » → pt-BR,
 * « es-419 » → es) ; null si le site ne la connaît pas. Même règle que dans l'app.
 */
export function matchLanguage(tag: string): Language | null {
  const [base = "", ...subtags] = tag.split(/[-_]/);
  // la région : deux lettres ou trois chiffres, après un éventuel script (« zh-Hant-TW »)
  const region = subtags.find((part) => /^(?:[A-Za-z]{2}|\d{3})$/.test(part))?.toUpperCase();
  switch (base.toLowerCase()) {
    case "fr":
      return "fr";
    case "es":
      return "es";
    case "de":
      return "de";
    case "it":
      return "it";
    case "en":
      return region !== undefined && BRITISH_ENGLISH.has(region) ? "en-GB" : "en";
    case "pt":
      return region !== undefined && EUROPEAN_PORTUGUESE.has(region) ? "pt-PT" : "pt-BR";
    default:
      return null;
  }
}

/** La première des langues préférées du navigateur (`navigator.languages`) que le site connaît ; null si aucune. */
export function detectLanguage(preferred: readonly string[]): Language | null {
  for (const tag of preferred) {
    const language = matchLanguage(tag);
    if (language) {
      return language;
    }
  }
  return null;
}

/** Segment d'adresse d'une langue : « fr », « en-gb ». */
export function languagePath(language: Language): string {
  return language.toLowerCase();
}

/** La langue d'un segment d'adresse ; null si ce n'est pas une langue du site. */
export function languageFromPath(path: string): Language | null {
  return LANGUAGES.find((language) => languagePath(language) === path) ?? null;
}

/** Adresse de la page d'accueil d'une langue, depuis la racine du site : « /fr/ ». */
export function languageHref(language: Language): string {
  return `/${languagePath(language)}/`;
}

/** Le lien de chaque langue, pour le choix de la langue : son code, son nom et l'adresse de sa page. */
export function languageLinks() {
  return LANGUAGES.map((code) => ({ code, name: LANGUAGE_NAMES[code], href: languageHref(code) }));
}

/**
 * Page vers laquelle la racine du site envoie un navigateur, d'après ses langues préférées : la
 * première que le site connaît, sinon l'anglais.
 */
export function rootRedirect(preferred: readonly string[]): string {
  return languageHref(detectLanguage(preferred) ?? FALLBACK_LANGUAGE);
}
