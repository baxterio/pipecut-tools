import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Logo } from "../Logo";
import { AnimatedLogo } from "./AnimatedLogo";

/** Les formes dessinées, sans ce qui change d'un logo à l'autre : identifiants, dégradé et masque. */
function shapes(container: HTMLElement): string[] {
  return Array.from(container.querySelectorAll("rect, polygon"), (shape) =>
    shape.outerHTML.replace(/ (?:id|fill|mask)="[^"]*"/g, "")
  );
}

describe("AnimatedLogo", () => {
  it("est décoratif", () => {
    const { container } = render(<AnimatedLogo />);

    expect(container.firstElementChild).toHaveAttribute("aria-hidden", "true");
  });

  it("superpose quatre calques, du fond au grand triangle entier", () => {
    const { container } = render(<AnimatedLogo />);
    const layers = Array.from(container.querySelectorAll("svg"), (svg) => svg.dataset.layer);

    expect(layers).toEqual(["background", "cut", "mark", "whole"]);
  });

  it("donne la même boîte de vue aux quatre calques, pour qu'ils se superposent exactement", () => {
    const { container } = render(<AnimatedLogo />);
    const viewBoxes = new Set(Array.from(container.querySelectorAll("svg"), (svg) => svg.getAttribute("viewBox")));

    expect(viewBoxes.size).toBe(1);
  });

  it("dessine les formes du logo statique, puis le grand triangle entier d'avant la coupe", () => {
    const fixed = shapes(render(<Logo />).container);
    const animated = shapes(render(<AnimatedLogo />).container);

    expect(animated.slice(0, fixed.length)).toEqual(fixed);
    expect(animated).toHaveLength(fixed.length + 1);
  });
});
