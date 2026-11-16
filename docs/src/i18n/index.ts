import { createInstance, type TFunction } from "i18next";
import type { TitleWords } from "../lib/sequence";
import { FALLBACK_LANGUAGE, type Language, REFERENCE_LANGUAGE } from "./languages";
import de from "./locales/de.json";
import en from "./locales/en.json";
import enGB from "./locales/en-GB.json";
import es from "./locales/es.json";
import fr from "./locales/fr.json";
import it from "./locales/it.json";
import ptBR from "./locales/pt-BR.json";
import ptPT from "./locales/pt-PT.json";

export * from "./languages";

/**
 * Les textes du site, un fichier par langue. fr.json fait référence : les clés sont typées dessus, et un
 * test vérifie que les autres langues ont les mêmes.
 */
export const resources = {
  fr: { translation: fr },
  en: { translation: en },
  "en-GB": { translation: enGB },
  es: { translation: es },
  de: { translation: de },
  it: { translation: it },
  "pt-BR": { translation: ptBR },
  "pt-PT": { translation: ptPT },
} as const satisfies Record<Language, unknown>;

declare module "i18next" {
  interface CustomTypeOptions {
    defaultNS: "translation";
    resources: { translation: typeof fr };
  }
}

/**
 * Même outil que dans l'app : i18next. Ici, il ne tourne qu'au build : chaque page est écrite en HTML
 * dans sa langue, et les deux menus hydratés reçoivent leurs textes déjà traduits. Le navigateur ne
 * charge donc ni i18next ni les fichiers de langue.
 */
const i18n = createInstance();
void i18n.init({
  lng: REFERENCE_LANGUAGE,
  // une clé manquante (impossible : un test compare chaque langue au français) s'afficherait en anglais
  fallbackLng: FALLBACK_LANGUAGE,
  resources,
  // les textes sont embarqués : rien à charger, l'instance est prête dès l'import
  initAsync: false,
  // Astro et React échappent déjà le texte
  interpolation: { escapeValue: false },
});

/** Fonction de traduction d'une langue : `t("hero.free")`, `t("download.freeWithVersion", { version })`. */
export type Translate = TFunction;

/** Les textes d'une langue. Chaque page demande la sienne : l'instance n'a pas de langue courante à changer. */
export function translator(language: Language): Translate {
  return i18n.getFixedT(language);
}

/** Les trois mots du titre du haut de page, adaptés à la langue plutôt que traduits mot à mot. */
export function heroTitle(t: Translate): TitleWords {
  return {
    download: t("hero.title.download"),
    cut: t("hero.title.cut"),
    subtitle: t("hero.title.subtitle"),
  };
}

/** Les textes du bouton Partager et de son panneau. */
export function shareLabels(t: Translate) {
  return {
    button: t("header.share"),
    title: t("share.title"),
    close: t("common.close"),
    networks: t("share.networks"),
    copyHeading: t("share.copyHeading"),
    copy: t("share.copy"),
    copied: t("share.copied"),
    copyLink: t("share.copyLink"),
    linkCopied: t("share.linkCopied"),
    newTab: t("share.newTab"),
  };
}
