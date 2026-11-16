import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SocialCard } from "./SocialCard";

const TITLE = { download: "Télécharge.", cut: "Découpe.", subtitle: "Sous-titre." };

describe("SocialCard", () => {
  it("montre le logo, le titre et l'accroche du haut de page", () => {
    const { container } = render(<SocialCard title={TITLE} tagline="Le bon extrait, au bon format, prêt à poster." />);

    expect(container.querySelector("[data-animated-logo]")).not.toBeNull();
    expect(screen.getByRole("heading", { level: 1, name: "Télécharge. Découpe. Sous-titre." })).toBeInTheDocument();
    expect(screen.getByText("Le bon extrait, au bon format, prêt à poster.")).toBeInTheDocument();
  });

  it("ne contient ni lien ni bouton : c'est une image", () => {
    render(<SocialCard title={TITLE} tagline="Le bon extrait, au bon format, prêt à poster." />);

    expect(screen.queryByRole("link")).toBeNull();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
