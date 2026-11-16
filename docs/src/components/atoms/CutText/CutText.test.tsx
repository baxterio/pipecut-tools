import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CutText } from "./CutText";

describe("CutText", () => {
  it("dessine le mot deux fois, à partir du même texte", () => {
    const { container } = render(<CutText text="Découpe." />);
    const halves = container.querySelectorAll("[data-half]");

    expect(halves).toHaveLength(2);
    expect(halves[0]).toHaveTextContent("Découpe.");
    // la moitié haute reçoit le mot en attribut : la feuille de style le dessine
    expect(halves[1]).toHaveAttribute("data-text", "Découpe.");
  });

  it("n'écrit le mot qu'une fois dans le texte de la page", () => {
    const { container } = render(<CutText text="Découpe." />);

    expect(container.textContent).toBe("Découpe.");
    expect(container.querySelector("[data-half='top']")).toBeEmptyDOMElement();
  });

  it("masque la moitié haute, dupliquée, aux lecteurs d'écran", () => {
    const { container } = render(<CutText text="Découpe." />);

    expect(container.querySelector("[data-half='top']")).toHaveAttribute("aria-hidden", "true");
    expect(container.querySelector("[data-half='bottom']")).not.toHaveAttribute("aria-hidden");
  });
});
