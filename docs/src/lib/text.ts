/**
 * Découpe un texte en caractères tels qu'on les lit : une lettre accentuée ou un emoji composé
 * compte pour un seul caractère, dans toutes les écritures.
 */
export function splitGraphemes(text: string): string[] {
  const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
  return Array.from(segmenter.segment(text), (part) => part.segment);
}
