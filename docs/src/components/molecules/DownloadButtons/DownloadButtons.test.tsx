import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { DownloadButtons } from "./DownloadButtons";

const MAC = { label: "Télécharger pour Mac", href: "https://example.com/pipecut-arm64.dmg" };
const WINDOWS = { label: "Télécharger pour Windows", href: "https://example.com/pipecut-x64.exe" };

describe("DownloadButtons", () => {
  it("affiche les deux boutons, chacun avec son lien vers le fichier", () => {
    render(<DownloadButtons id="telecharger" downloads={[MAC, WINDOWS]} />);

    expect(screen.getByRole("link", { name: MAC.label })).toHaveAttribute("href", MAC.href);
    expect(screen.getByRole("link", { name: WINDOWS.label })).toHaveAttribute("href", WINDOWS.href);
    expect(screen.getAllByRole("link")).toHaveLength(2);
  });

  it("donne le même style aux deux boutons : aucun système n'est mis en avant", () => {
    render(<DownloadButtons id="telecharger" downloads={[MAC, WINDOWS]} />);
    const [mac, windows] = screen.getAllByRole("link");

    expect(mac?.className).not.toBe("");
    expect(mac?.className).toBe(windows?.className);
    expect(mac?.querySelector("svg")?.outerHTML).toBe(windows?.querySelector("svg")?.outerHTML);
  });

  it("porte l'ancre du bloc", () => {
    const { container } = render(<DownloadButtons id="telecharger" downloads={[MAC, WINDOWS]} />);

    expect(container.querySelector("#telecharger")).toContainElement(screen.getByRole("link", { name: MAC.label }));
  });
});
