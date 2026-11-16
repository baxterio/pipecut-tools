import { describe, expect, it } from "vitest";
import { heroTitle, LANGUAGES, translator } from "../i18n";
import { buildTimeline, toCssVariables } from "./sequence";

const FRENCH = heroTitle(translator("fr"));
const ENGLISH = heroTitle(translator("en"));

describe("buildTimeline", () => {
  it("reproduit le déroulé de la spec pour le titre français", () => {
    const timeline = buildTimeline(FRENCH);

    expect(timeline.logoIn).toEqual({ start: 0, duration: 0.3, end: 0.3 });
    expect(timeline.fillIn).toEqual({ start: 0.3, duration: 0.3, end: 0.6 });
    expect(timeline.fill).toEqual({ start: 0.6, duration: 1, end: 1.6 });
    expect(timeline.content).toEqual({ start: 0.7, duration: 0.9, end: 1.6 });
    expect(timeline.cutIn).toEqual({ start: 1.75, duration: 0.15, end: 1.9 });
    expect(timeline.cut).toEqual({ start: 1.9, duration: 0.25, end: 2.15 });
    expect(timeline.logoCut).toEqual({ start: 2.01, duration: 0.24, end: 2.25 });
    expect(timeline.band).toBe(2.25);
    expect(timeline.typing).toEqual({ start: 2.35, duration: 0.5, end: 2.85, characters: 11, perCharacter: 0.05 });
    expect(timeline.total).toBe(2.85);
  });

  it("reste brève : le titre français est complet avant 2,9 s", () => {
    expect(buildTimeline(FRENCH).total).toBeLessThanOrEqual(2.9);
  });

  it.each(LANGUAGES)("enchaîne les étapes dans l'ordre de la spec en « %s »", (language) => {
    const t = buildTimeline(heroTitle(translator(language)));
    const order = [
      t.logoIn.start,
      t.logoIn.end,
      t.fillIn.start,
      t.fillIn.end,
      t.fill.start,
      t.fill.end,
      t.cutIn.start,
      t.cutIn.end,
      t.cut.start,
      t.logoCut.start,
      t.cut.end,
      t.logoCut.end,
      t.band,
      t.typing.start,
      t.typing.end,
    ];
    expect(order).toEqual(order.toSorted((a, b) => a - b));
    // le reste du haut de page apparaît pendant le remplissage du premier mot
    expect(t.content.start).toBeGreaterThan(t.fill.start);
    expect(t.content.end).toBeLessThanOrEqual(t.fill.end);
  });

  it("fait durer l'écriture selon le nombre de lettres du mot", () => {
    const french = buildTimeline(FRENCH);
    const english = buildTimeline(ENGLISH);

    expect(french.typing.characters).toBe(11); // « Sous-titre. »
    expect(english.typing.characters).toBe(8); // « Caption. »
    expect(english.typing.start).toBe(french.typing.start);
    expect(english.typing.end).toBe(2.7);
    expect(english.total).toBeLessThan(french.total);
  });

  it("compte une lettre accentuée ou un emoji composé pour un seul caractère", () => {
    const decomposed = buildTimeline({ download: "", cut: "", subtitle: "été" }); // « été » décomposé
    expect(decomposed.typing.characters).toBe(3);

    const emoji = buildTimeline({ download: "", cut: "", subtitle: "👩‍💻." });
    expect(emoji.typing.characters).toBe(2);
  });

  it("ne produit pas de durée négative pour un mot vide", () => {
    const empty = buildTimeline({ download: "", cut: "", subtitle: "" });
    expect(empty.typing.duration).toBe(0);
    expect(empty.typing.end).toBe(empty.typing.start);
  });
});

describe("toCssVariables", () => {
  it("expose chaque étape en secondes", () => {
    expect(toCssVariables(buildTimeline(FRENCH))).toEqual({
      "--seq-logo-in-at": "0s",
      "--seq-logo-in-for": "0.3s",
      "--seq-fill-in-at": "0.3s",
      "--seq-fill-in-for": "0.3s",
      "--seq-fill-at": "0.6s",
      "--seq-fill-for": "1s",
      "--seq-content-at": "0.7s",
      "--seq-content-for": "0.9s",
      "--seq-cut-in-at": "1.75s",
      "--seq-cut-in-for": "0.15s",
      "--seq-cut-at": "1.9s",
      "--seq-cut-for": "0.25s",
      "--seq-logo-cut-at": "2.01s",
      "--seq-logo-cut-for": "0.24s",
      "--seq-band-at": "2.25s",
      "--seq-type-at": "2.35s",
      "--seq-type-step": "0.05s",
    });
  });
});
