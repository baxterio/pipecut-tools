import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Icon, type IconName } from "./Icon";

const NAMES: IconName[] = [
  "download",
  "share",
  "play",
  "check",
  "chevron",
  "close",
  "x",
  "bluesky",
  "facebook",
  "whatsapp",
  "linkedin",
  "telegram",
];

describe("Icon", () => {
  it.each(NAMES)("dessine l'icône « %s », masquée aux lecteurs d'écran", (name) => {
    const { container } = render(<Icon name={name} />);
    const svg = container.querySelector("svg");

    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("data-icon", name);
    expect(svg?.querySelector("path, circle")).not.toBeNull();
  });

  it("prend la taille demandée", () => {
    const { container } = render(<Icon name="download" size={19} />);
    const svg = container.querySelector("svg");

    expect(svg).toHaveAttribute("width", "19");
    expect(svg).toHaveAttribute("height", "19");
  });
});
