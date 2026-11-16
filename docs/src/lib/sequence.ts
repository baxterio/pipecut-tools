import { splitGraphemes } from "./text";

/**
 * Séquence animée du haut de page (spec, section 4). Elle est brève, pour ne pas retarder la lecture :
 * en français, le titre est complet avant 2,9 s.
 *
 * Les temps ne sont pas fixes : chaque étape démarre à partir de la fin de la précédente, parce que
 * la durée de l'écriture dépend du nombre de lettres du mot dans chaque langue. La timeline est
 * calculée au build, puis posée en variables CSS sur le haut de page : les animations sont en CSS,
 * sans JavaScript, et partent toutes de la même horloge (le chargement de la page).
 *
 * Toutes les valeurs sont en secondes.
 */
export const SEQUENCE = {
  /** Le logo apparaît en fondu, de 92 % à 100 % de sa taille. */
  logoIn: { duration: 0.3 },
  /** Le premier mot apparaît en fondu, lettres grises, dès que le logo est en place. */
  fillIn: { gap: 0, duration: 0.3 },
  /** Le vert remplit le premier mot de gauche à droite, par à-coups. */
  fill: { gap: 0, duration: 1 },
  /** Le deuxième mot apparaît, entier. */
  cutIn: { gap: 0.15, duration: 0.15 },
  /** Tchac : la moitié haute du deuxième mot saute puis se cale. */
  cut: { gap: 0, duration: 0.25 },
  /** Le logo se coupe en même temps, un rien après le début du tchac. */
  logoCut: { offset: 0.11, duration: 0.24 },
  /** Le bandeau du troisième mot apparaît, vide. */
  band: { gap: 0.1 },
  /** Le troisième mot s'écrit lettre par lettre. */
  typing: { gap: 0.1, perCharacter: 0.05 },
  /** L'accroche, les boutons, les mentions et le lien vidéo apparaissent peu après le début du remplissage. */
  content: { offset: 0.1, duration: 0.9 },
} as const;

export interface Step {
  start: number;
  duration: number;
  end: number;
}

export interface Timeline {
  logoIn: Step;
  fillIn: Step;
  fill: Step;
  content: Step;
  cutIn: Step;
  cut: Step;
  logoCut: Step;
  /** Instant où le bandeau du troisième mot apparaît. */
  band: number;
  /** `start` est l'apparition de la première lettre, `end` celle de la dernière. */
  typing: Step & { characters: number; perCharacter: number };
  /** Fin de la séquence. */
  total: number;
}

/** Les trois mots du titre, tels qu'ils sont affichés dans une langue. */
export interface TitleWords {
  download: string;
  cut: string;
  subtitle: string;
}

// arrondi à la milliseconde : évite 0.6499999999999999 dans le HTML généré
function round(value: number): number {
  return Math.round(value * 1000) / 1000;
}

function step(start: number, duration: number): Step {
  return { start: round(start), duration: round(duration), end: round(start + duration) };
}

export function buildTimeline(title: TitleWords): Timeline {
  const logoIn = step(0, SEQUENCE.logoIn.duration);
  const fillIn = step(logoIn.end + SEQUENCE.fillIn.gap, SEQUENCE.fillIn.duration);
  const fill = step(fillIn.end + SEQUENCE.fill.gap, SEQUENCE.fill.duration);
  const content = step(fill.start + SEQUENCE.content.offset, SEQUENCE.content.duration);
  const cutIn = step(fill.end + SEQUENCE.cutIn.gap, SEQUENCE.cutIn.duration);
  const cut = step(cutIn.end + SEQUENCE.cut.gap, SEQUENCE.cut.duration);
  const logoCut = step(cut.start + SEQUENCE.logoCut.offset, SEQUENCE.logoCut.duration);
  const band = round(cut.end + SEQUENCE.band.gap);

  const characters = splitGraphemes(title.subtitle).length;
  const perCharacter = SEQUENCE.typing.perCharacter;
  const typing = {
    ...step(band + SEQUENCE.typing.gap, Math.max(characters - 1, 0) * perCharacter),
    characters,
    perCharacter,
  };

  const total = Math.max(typing.end, logoCut.end, content.end);
  return { logoIn, fillIn, fill, content, cutIn, cut, logoCut, band, typing, total };
}

/** Variables CSS de la séquence, lues par les feuilles de style des composants animés. */
export type SequenceVariables = Record<`--seq-${string}`, string>;

function seconds(value: number): string {
  return `${round(value)}s`;
}

export function toCssVariables(timeline: Timeline): SequenceVariables {
  return {
    "--seq-logo-in-at": seconds(timeline.logoIn.start),
    "--seq-logo-in-for": seconds(timeline.logoIn.duration),
    "--seq-fill-in-at": seconds(timeline.fillIn.start),
    "--seq-fill-in-for": seconds(timeline.fillIn.duration),
    "--seq-fill-at": seconds(timeline.fill.start),
    "--seq-fill-for": seconds(timeline.fill.duration),
    "--seq-content-at": seconds(timeline.content.start),
    "--seq-content-for": seconds(timeline.content.duration),
    "--seq-cut-in-at": seconds(timeline.cutIn.start),
    "--seq-cut-in-for": seconds(timeline.cutIn.duration),
    "--seq-cut-at": seconds(timeline.cut.start),
    "--seq-cut-for": seconds(timeline.cut.duration),
    "--seq-logo-cut-at": seconds(timeline.logoCut.start),
    "--seq-logo-cut-for": seconds(timeline.logoCut.duration),
    "--seq-band-at": seconds(timeline.band),
    "--seq-type-at": seconds(timeline.typing.start),
    "--seq-type-step": seconds(timeline.typing.perCharacter),
  };
}
