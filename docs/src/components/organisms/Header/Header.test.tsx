import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { shareLabels, translator } from "../../../i18n";
import { DOWNLOAD_URLS, SITE_URL } from "../../../lib/site";
import { DownloadMenuButton } from "../../molecules/DownloadMenuButton";
import { ShareButton } from "../../molecules/ShareButton";
import { Header } from "./Header";

const t = translator("fr");

function renderHeader() {
  return render(
    <Header
      homeLabel={t("header.home")}
      share={<button type="button">Partager</button>}
      download={<button type="button">Télécharger</button>}
    />
  );
}

/** Le header tel que la page l'assemble, avec ses deux boutons et leurs menus. */
function renderHeaderWithMenus() {
  return render(
    <Header
      homeLabel={t("header.home")}
      share={
        <ShareButton
          labels={shareLabels(t)}
          preview={{ title: "PipeCut", description: t("hero.tagline.promise"), domain: "pipecut.app" }}
          url={SITE_URL}
          text={t("share.text")}
        />
      }
      download={
        <DownloadMenuButton
          label={t("header.download")}
          title={t("download.title")}
          closeLabel={t("common.close")}
          choices={[
            { label: t("download.mac"), requirement: t("download.macRequirement"), href: DOWNLOAD_URLS.mac },
            {
              label: t("download.windows"),
              requirement: t("download.windowsRequirement"),
              href: DOWNLOAD_URLS.windows,
            },
          ]}
          mentions={t("hero.free")}
        />
      }
    />
  );
}

describe("Header", () => {
  it("affiche la marque, qui ramène en haut de la page", () => {
    renderHeader();
    const brand = screen.getByRole("link", { name: "PipeCut, retour en haut de la page" });

    expect(brand).toHaveAttribute("href", "#top");
    expect(brand).toHaveTextContent("PipeCut");
  });

  it("place Partager puis Télécharger à droite", () => {
    renderHeader();
    const banner = screen.getByRole("banner");
    const share = within(banner).getByRole("button", { name: "Partager" });
    const download = within(banner).getByRole("button", { name: "Télécharger" });

    expect(share.compareDocumentPosition(download) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("n'a aucun lien de navigation pour l'instant", () => {
    renderHeader();

    expect(screen.queryByRole("navigation")).toBeNull();
    expect(screen.getAllByRole("link")).toHaveLength(1);
  });
});

const shareMenu = () => screen.queryByRole("dialog", { name: "Partager PipeCut" });
const downloadMenu = () => screen.queryByRole("dialog", { name: "Télécharger PipeCut" });

describe("Header : menus", () => {
  it("n'a aucun menu ouvert au départ", () => {
    renderHeaderWithMenus();

    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("ferme le menu Partager quand le menu Télécharger s'ouvre", async () => {
    renderHeaderWithMenus();
    await userEvent.click(screen.getByRole("button", { name: "Partager" }));
    expect(shareMenu()).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Télécharger" }));

    expect(shareMenu()).toBeNull();
    expect(downloadMenu()).toHaveFocus();
    expect(screen.getByRole("button", { name: "Partager" })).toHaveAttribute("aria-expanded", "false");
  });

  it("ferme le menu Télécharger quand le menu Partager s'ouvre", async () => {
    renderHeaderWithMenus();
    await userEvent.click(screen.getByRole("button", { name: "Télécharger" }));
    expect(downloadMenu()).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: "Partager" }));

    expect(downloadMenu()).toBeNull();
    expect(shareMenu()).toHaveFocus();
    expect(screen.getByRole("button", { name: "Télécharger" })).toHaveAttribute("aria-expanded", "false");
  });
});
