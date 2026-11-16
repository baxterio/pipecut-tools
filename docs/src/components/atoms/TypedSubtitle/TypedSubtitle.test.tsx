import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TypedSubtitle } from "./TypedSubtitle";

function characters(container: HTMLElement) {
  return Array.from(container.querySelectorAll<HTMLElement>("[data-character]"));
}

describe("TypedSubtitle", () => {
  it("découpe le mot en caractères, numérotés dans l'ordre", () => {
    const { container } = render(<TypedSubtitle text="Sous-titre." />);
    const spans = characters(container);

    expect(spans.map((span) => span.textContent)).toEqual(["S", "o", "u", "s", "-", "t", "i", "t", "r", "e", "."]);
    expect(spans.map((span) => span.style.getPropertyValue("--i"))).toEqual([
      "0",
      "1",
      "2",
      "3",
      "4",
      "5",
      "6",
      "7",
      "8",
      "9",
      "10",
    ]);
    expect(container).toHaveTextContent("Sous-titre.");
  });

  it("s'adapte à la longueur du mot dans une autre langue", () => {
    const { container } = render(<TypedSubtitle text="Caption." />);

    expect(characters(container)).toHaveLength(8);
  });

  it("garde entiers les caractères composés", () => {
    const { container } = render(<TypedSubtitle text={"été."} />);

    expect(characters(container)).toHaveLength(4);
  });
});
