import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { translator } from "../../../i18n";
import { DownloadMenuButton } from "./DownloadMenuButton";

const MAC_URL = "https://example.com/pipecut-arm64.dmg";
const WINDOWS_URL = "https://example.com/pipecut-x64.exe";

const t = translator("fr");

function renderDownloadMenuButton(mentions = t("hero.free")) {
  return render(
    <>
      <DownloadMenuButton
        label={t("header.download")}
        title={t("download.title")}
        closeLabel={t("common.close")}
        choices={[
          { label: t("download.mac"), requirement: t("download.macRequirement"), href: MAC_URL },
          { label: t("download.windows"), requirement: t("download.windowsRequirement"), href: WINDOWS_URL },
        ]}
        mentions={mentions}
      />
      <p>Ailleurs dans la page</p>
    </>
  );
}

const trigger = () => screen.getByRole("button", { name: "Télécharger" });
const panel = () => screen.queryByRole("dialog", { name: "Télécharger PipeCut" });

describe("DownloadMenuButton : bouton", () => {
  it("est fermé au départ, avec sa petite flèche", () => {
    renderDownloadMenuButton();

    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger().querySelector("svg")).toHaveAttribute("data-icon", "chevron");
    expect(trigger().querySelector("svg")).toHaveAttribute("width", "14");
    expect(panel()).toBeNull();
  });

  it("ouvre le panneau au clic, et y place le focus", async () => {
    renderDownloadMenuButton();
    await userEvent.click(trigger());

    expect(panel()).toHaveFocus();
    // l'état ouvert du bouton (couleur de survol, flèche retournée) repose sur aria-expanded
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(trigger()).toHaveAttribute("aria-controls", panel()?.id);
  });

  it("referme le panneau au clic suivant sur le bouton", async () => {
    renderDownloadMenuButton();
    await userEvent.click(trigger());
    await userEvent.click(trigger());

    expect(panel()).toBeNull();
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });
});

describe("DownloadMenuButton : panneau", () => {
  it("propose les deux systèmes, chacun avec son lien vers le fichier, puis les mentions", async () => {
    renderDownloadMenuButton(t("download.freeWithVersion", { version: "1.4.0" }));
    await userEvent.click(trigger());
    const links = within(panel() as HTMLElement).getAllByRole("link");

    expect(links).toHaveLength(2);
    expect(links[0]).toHaveTextContent("Pour Mac");
    expect(links[0]).toHaveTextContent("Puce Apple (M1 et plus récents)");
    expect(links[0]).toHaveAttribute("href", MAC_URL);
    expect(links[1]).toHaveTextContent("Pour Windows");
    expect(links[1]).toHaveTextContent("Windows 10 et 11");
    expect(links[1]).toHaveAttribute("href", WINDOWS_URL);
    expect(within(panel() as HTMLElement).getByText("Gratuit · Sans compte · v1.4.0")).toBeInTheDocument();
  });

  it("se ferme par la croix, et rend le focus au bouton", async () => {
    renderDownloadMenuButton();
    await userEvent.click(trigger());
    await userEvent.click(screen.getByRole("button", { name: "Fermer" }));

    expect(panel()).toBeNull();
    expect(trigger()).toHaveFocus();
  });

  it("se ferme au clic à l'extérieur", async () => {
    renderDownloadMenuButton();
    await userEvent.click(trigger());
    await userEvent.click(screen.getByText("Ailleurs dans la page"));

    expect(panel()).toBeNull();
  });

  it("se ferme avec la touche Échap, et rend le focus au bouton", async () => {
    const user = userEvent.setup();
    renderDownloadMenuButton();
    await user.click(trigger());
    await user.tab();
    await user.keyboard("{Escape}");

    expect(panel()).toBeNull();
    expect(trigger()).toHaveFocus();
  });

  it("se ferme au clic sur un système : le téléchargement est lancé", async () => {
    renderDownloadMenuButton();
    await userEvent.click(trigger());
    const mac = screen.getByRole("link", { name: /Pour Mac/ });
    // jsdom ne sait pas télécharger : le clic ne fait qu'appeler le gestionnaire
    mac.addEventListener("click", (event) => event.preventDefault());
    await userEvent.click(mac);

    expect(panel()).toBeNull();
    expect(trigger()).toHaveFocus();
  });
});
