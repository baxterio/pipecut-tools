/** Adresses et constantes du site, réunies ici pour être modifiées à un seul endroit. */
// L'import porte son extension : scripts/og.ts, que Node lance sans bundler, lit aussi ce fichier.
import { type Language, languageHref, languagePath, REFERENCE_LANGUAGE } from "../i18n/languages.ts";

export const SITE_URL = "https://pipecut.app";
export const SITE_NAME = "PipeCut";
/** Nom de domaine affiché dans l'aperçu du partage : pipecut.app */
export const SITE_DOMAIN = new URL(SITE_URL).host;

/** Ancre du haut de la page, comprise de tous les navigateurs sans élément à ce nom. */
export const TOP_ANCHOR = "top";
/** Ancre du bloc des boutons de téléchargement du haut de page. */
export const DOWNLOAD_ANCHOR = "telecharger";
/** Ancre de la section vidéo (à venir). */
export const VIDEO_ANCHOR = "video";

const RELEASES = "https://github.com/baxterio/pipecut-tools/releases/latest/download";

/**
 * Fichiers d'installation, dans la dernière release de l'app sur pipecut-tools. Ce dépôt reçoit aussi
 * les releases des outils (ffmpeg, whisper-cli), publiées en préversions : `releases/latest` les ignore
 * et mène toujours à l'app.
 *
 * Les fichiers n'ont pas de numéro de version dans leur nom, pour que ces liens restent valables d'une
 * version à l'autre. La publication de l'app donne déjà ce nom au .dmg ; l'installeur Windows est à
 * publier dans la même release sous le nom `pipecut-x64.exe`.
 */
export const DOWNLOAD_URLS = {
  mac: `${RELEASES}/pipecut-arm64.dmg`,
  windows: `${RELEASES}/pipecut-x64.exe`,
} as const;

/** Taille des images d'aperçu de lien, en pixels : celle que les réseaux attendent. */
export const OG_IMAGE = { width: 1200, height: 630 } as const;

/**
 * Numéro de version de l'app, affiché dans le menu Télécharger : « 1.4.0 ». Il est tiré de la valeur
 * fournie au build (variable d'environnement PIPECUT_VERSION), qui peut être un numéro seul ou le tag
 * d'une release : « 1.4.0 », « v1.4.0 », « pipecut-1.4.0 ». Sans numéro reconnaissable, il n'y en a
 * pas, et le menu n'affiche pas de version.
 */
export function appVersion(raw: string | undefined): string | undefined {
  return raw?.match(/\d+(?:\.\d+)+/)?.[0];
}

/** Adresse de la racine du site, qui envoie chaque navigateur vers sa langue. */
export const ROOT_URL = `${SITE_URL}/`;

/** Adresse de la page d'accueil d'une langue : https://pipecut.app/fr/ */
export function languageUrl(language: Language): string {
  return `${SITE_URL}${languageHref(language)}`;
}

/**
 * Adresse partagée par le menu Partager : la racine du site pour la langue de référence (spec, section 2),
 * dont la racine porte les balises d'aperçu ; la page de la langue pour les autres, afin que l'aperçu
 * de lien soit dans la bonne langue.
 */
export function shareUrl(language: Language): string {
  return language === REFERENCE_LANGUAGE ? SITE_URL : languageUrl(language);
}

/**
 * Adresse, depuis la racine du site, de la carte d'aperçu d'une langue : la page que `pnpm og`
 * photographie (src/pages/[lang]/og.astro, servie par le seul serveur de développement).
 */
export function ogCardHref(language: Language): string {
  return `${languageHref(language)}og/`;
}

/** Adresse, depuis la racine du site, de l'image d'aperçu de lien d'une langue : /og/fr.png */
export function ogImagePath(language: Language): string {
  return `/og/${languagePath(language)}.png`;
}

/** Image d'aperçu de lien d'une langue. */
export function ogImageUrl(language: Language): string {
  return `${SITE_URL}${ogImagePath(language)}`;
}
