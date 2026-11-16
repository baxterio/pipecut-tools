import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { TextLink } from "./TextLink";

describe("TextLink", () => {
  it("rend un lien vers l'adresse donnée", () => {
    render(<TextLink href="#video">Voir PipeCut en une minute</TextLink>);

    expect(screen.getByRole("link", { name: "Voir PipeCut en une minute" })).toHaveAttribute("href", "#video");
  });

  it("place l'icône avant le texte, sans changer le nom du lien", () => {
    render(
      <TextLink href="#video" icon={<svg aria-hidden="true" data-testid="icone" />}>
        Voir PipeCut en une minute
      </TextLink>
    );

    const link = screen.getByRole("link", { name: "Voir PipeCut en une minute" });
    expect(link.firstElementChild).toBe(screen.getByTestId("icone"));
  });
});
