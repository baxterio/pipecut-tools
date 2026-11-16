import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { heroTitle, translator } from "../../../i18n";
import { HeroTitle } from "./HeroTitle";

const FRENCH = heroTitle(translator("fr"));
const ENGLISH = heroTitle(translator("en"));

describe("HeroTitle", () => {
  it("est lu « Télécharge. Découpe. Sous-titre. » par les lecteurs d'écran", () => {
    render(<HeroTitle words={FRENCH} />);

    expect(screen.getByRole("heading", { level: 1, name: "Télécharge. Découpe. Sous-titre." })).toBeInTheDocument();
  });

  it("masque la moitié dupliquée de « Découpe. » aux lecteurs d'écran", () => {
    const { container } = render(<HeroTitle words={FRENCH} />);

    expect(container.querySelector("[data-half='top']")).toHaveAttribute("aria-hidden", "true");
  });

  it("masque les lignes animées, pour que le titre ne soit pas lu lettre par lettre", () => {
    const { container } = render(<HeroTitle words={FRENCH} />);
    const heading = screen.getByRole("heading", { level: 1 });

    expect(heading.children).toHaveLength(3);
    for (const line of heading.children) {
      expect(line).toHaveAttribute("aria-hidden", "true");
    }
    expect(container.querySelectorAll("[data-character]")).toHaveLength(11);
  });

  it("garde les trois mots sur trois lignes dans une autre langue", () => {
    render(<HeroTitle words={ENGLISH} />);
    const heading = screen.getByRole("heading", { level: 1, name: "Download. Cut. Caption." });

    expect(Array.from(heading.children, (line) => line.textContent)).toEqual(["Download.", "Cut.", "Caption."]);
  });

  it("a pour texte les trois mots, une fois chacun et séparés : c'est ce que lisent les moteurs de recherche", () => {
    render(<HeroTitle words={FRENCH} />);

    expect(screen.getByRole("heading", { level: 1 }).textContent).toBe("Télécharge. Découpe. Sous-titre.");
  });
});
