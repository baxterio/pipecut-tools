import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Logo } from "./Logo";

describe("Logo", () => {
  it("est décoratif et prend la taille demandée", () => {
    const { container } = render(<Logo size={26} />);
    const svg = container.querySelector("svg");

    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("width", "26");
    expect(svg).toHaveAttribute("height", "26");
  });

  it("donne des identifiants SVG distincts à chaque logo de la page", () => {
    const { container } = render(
      <>
        <Logo idPrefix="premier" />
        <Logo idPrefix="second" />
      </>
    );
    const ids = Array.from(container.querySelectorAll("[id]"), (element) => element.id);

    expect(ids).toEqual(["premier-gradient", "premier-mask", "second-gradient", "second-mask"]);
    expect(container.querySelector("rect[fill='url(#premier-gradient)']")).not.toBeNull();
    expect(container.querySelector("g[mask='url(#second-mask)']")).not.toBeNull();
  });
});
