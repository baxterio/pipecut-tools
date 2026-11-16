import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { DownloadMenu } from "./DownloadMenu";

const MAC = {
  label: "Pour Mac",
  requirement: "Puce Apple (M1 et plus récents)",
  href: "https://example.com/pipecut-arm64.dmg",
};
const WINDOWS = { label: "Pour Windows", requirement: "Windows 10 et 11", href: "https://example.com/pipecut-x64.exe" };

function renderMenu(props: Partial<Parameters<typeof DownloadMenu>[0]> = {}) {
  const onSelect = vi.fn();
  render(<DownloadMenu choices={[MAC, WINDOWS]} mentions="Gratuit · Sans compte" onSelect={onSelect} {...props} />);
  return { onSelect };
}

describe("DownloadMenu", () => {
  it("propose les deux systèmes, Mac puis Windows, chacun avec son lien vers le fichier", () => {
    renderMenu();
    const [mac, windows] = screen.getAllByRole("link");

    expect(screen.getAllByRole("link")).toHaveLength(2);
    expect(mac).toHaveTextContent("Pour Mac");
    expect(mac).toHaveTextContent("Puce Apple (M1 et plus récents)");
    expect(mac).toHaveAttribute("href", MAC.href);
    expect(windows).toHaveTextContent("Pour Windows");
    expect(windows).toHaveTextContent("Windows 10 et 11");
    expect(windows).toHaveAttribute("href", WINDOWS.href);
  });

  it("donne le même style aux deux choix : aucun système n'est mis en avant", () => {
    renderMenu();
    const [mac, windows] = screen.getAllByRole("link");

    expect(mac?.className).not.toBe("");
    expect(mac?.className).toBe(windows?.className);
    expect(mac?.querySelector("svg")).toHaveAttribute("data-icon", "download");
    expect(mac?.querySelector("svg")?.outerHTML).toBe(windows?.querySelector("svg")?.outerHTML);
  });

  it("prévient quand un système est choisi", async () => {
    const { onSelect } = renderMenu();
    const windows = screen.getByRole("link", { name: /Pour Windows/ });
    // jsdom ne sait pas télécharger : le clic ne fait qu'appeler le gestionnaire
    windows.addEventListener("click", (event) => event.preventDefault());

    await userEvent.click(windows);

    expect(onSelect).toHaveBeenCalledOnce();
  });

  it("affiche les mentions sous les choix, telles qu'elles lui sont données", () => {
    renderMenu({ mentions: "Gratuit · Sans compte · v1.4.0" });
    const mentions = screen.getByText("Gratuit · Sans compte · v1.4.0");

    expect(mentions.compareDocumentPosition(screen.getByRole("list"))).toBe(Node.DOCUMENT_POSITION_PRECEDING);
  });
});
