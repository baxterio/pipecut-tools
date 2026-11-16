import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { translator } from "../../../i18n";
import { Requirements } from "./Requirements";

describe("Requirements", () => {
  it("affiche la gratuité, puis la configuration requise", () => {
    const t = translator("fr");
    const { container } = render(<Requirements free={t("hero.free")} requirements={t("hero.requirements")} />);

    expect(screen.getByText("Gratuit · Sans compte")).toBeInTheDocument();
    expect(screen.getByText("Mac avec puce Apple (M1 et plus récents) · Windows 10 et 11")).toBeInTheDocument();
    expect(Array.from(container.querySelectorAll("p"), (p) => p.textContent)).toEqual([
      t("hero.free"),
      t("hero.requirements"),
    ]);
  });
});
