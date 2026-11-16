import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { shareLabels, translator } from "../../../i18n";
import { buildShareLinks } from "../../../lib/share";
import { SITE_URL } from "../../../lib/site";
import { ShareButton } from "./ShareButton";

const t = translator("fr");

function renderShareButton() {
  return render(
    <>
      <ShareButton
        labels={shareLabels(t)}
        preview={{ title: "PipeCut", description: t("hero.tagline.promise"), domain: "pipecut.app" }}
        url={SITE_URL}
        text={t("share.text")}
      />
      <p>Ailleurs dans la page</p>
      <a href="#suite">Lien suivant</a>
    </>
  );
}

const trigger = () => screen.getByRole("button", { name: "Partager" });
const panel = () => screen.queryByRole("dialog", { name: "Partager PipeCut" });
const pointer = () => document.querySelector("[data-popover-pointer]");

/** Fait passer le navigateur de test pour un appareil tactile (un téléphone), ou non. */
function stubTouchDevice(touch: boolean) {
  const matchMedia = vi.fn((query: string) => ({ matches: touch, media: query }));
  vi.stubGlobal("matchMedia", matchMedia);
  return matchMedia;
}

/** Donne au navigateur de test un partage natif, qui réussit ou échoue. */
function stubNativeShare(outcome: () => Promise<void> = () => Promise.resolve()) {
  const share = vi.fn(outcome);
  Object.defineProperty(navigator, "share", { value: share, configurable: true });
  return share;
}

/** Laisse se terminer ce qui attend la réponse du partage natif. */
function settle() {
  return act(async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
  Reflect.deleteProperty(navigator, "share");
});

describe("ShareButton : ouverture et fermeture", () => {
  it("est fermé au départ", () => {
    renderShareButton();

    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).toHaveAttribute("aria-haspopup", "dialog");
    expect(panel()).toBeNull();
    expect(pointer()).toBeNull();
  });

  it("ouvre le panneau au clic, avec sa pointe, et y place le focus", async () => {
    const user = userEvent.setup();
    renderShareButton();

    await user.click(trigger());

    expect(panel()).toBeInTheDocument();
    expect(panel()).toHaveFocus();
    expect(pointer()).toBeInTheDocument();
    // l'état ouvert du bouton (fond de survol conservé, contour plus clair) repose sur aria-expanded
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
    expect(trigger()).toHaveAttribute("aria-controls", panel()?.id);
  });

  it("garde son nom sur écran étroit, où son libellé est masqué", () => {
    renderShareButton();

    expect(trigger()).toHaveAttribute("aria-label", "Partager");
    expect(trigger()).toHaveTextContent("Partager");
  });

  it("construit le lien de chaque réseau à partir du texte et de l'adresse partagés", async () => {
    const user = userEvent.setup();
    renderShareButton();

    await user.click(trigger());

    const links = within(panel() as HTMLElement).getAllByRole("link");
    expect(links.map((link) => link.getAttribute("href"))).toEqual(
      buildShareLinks(t("share.text"), SITE_URL).map((link) => link.href)
    );
  });

  it("referme le panneau au clic suivant sur le bouton", async () => {
    const user = userEvent.setup();
    renderShareButton();

    await user.click(trigger());
    await user.click(trigger());

    expect(panel()).toBeNull();
    expect(pointer()).toBeNull();
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });

  it("ferme le panneau par la croix, et rend le focus au bouton", async () => {
    const user = userEvent.setup();
    renderShareButton();

    await user.click(trigger());
    await user.click(screen.getByRole("button", { name: "Fermer" }));

    expect(panel()).toBeNull();
    expect(trigger()).toHaveFocus();
  });

  it("ferme le panneau au clic sur un réseau, et rend le focus au bouton", async () => {
    const user = userEvent.setup();
    renderShareButton();

    await user.click(trigger());
    await user.click(screen.getByRole("link", { name: /Telegram/ }));

    expect(panel()).toBeNull();
    expect(trigger()).toHaveFocus();
  });

  it("ferme le panneau au clic à l'extérieur", async () => {
    const user = userEvent.setup();
    renderShareButton();

    await user.click(trigger());
    await user.click(screen.getByText("Ailleurs dans la page"));

    expect(panel()).toBeNull();
  });

  it("garde le panneau ouvert au clic à l'intérieur", async () => {
    const user = userEvent.setup();
    renderShareButton();

    await user.click(trigger());
    await user.click(screen.getByText("Sur les réseaux"));

    expect(panel()).toBeInTheDocument();
  });

  it("ferme le panneau quand la tabulation en sort, sans rappeler le focus", async () => {
    const user = userEvent.setup();
    renderShareButton();
    const next = screen.getByRole("link", { name: "Lien suivant" });

    await user.click(trigger());
    // la croix, les six réseaux, le champ, le bouton de copie : le panneau reste ouvert
    for (let step = 0; step < 9; step++) {
      await user.tab();
      expect(panel()).toBeInTheDocument();
    }
    expect(screen.getByRole("button", { name: "Copier le lien" })).toHaveFocus();
    await user.tab();

    expect(next).toHaveFocus();
    expect(panel()).toBeNull();
  });

  it("garde le panneau ouvert quand la tabulation revient sur le bouton", async () => {
    const user = userEvent.setup();
    renderShareButton();

    await user.click(trigger());
    await user.tab();
    await user.tab({ shift: true });

    expect(trigger()).toHaveFocus();
    expect(panel()).toBeInTheDocument();
  });

  it("ferme le panneau avec la touche Échap, et rend le focus au bouton", async () => {
    const user = userEvent.setup();
    renderShareButton();

    await user.click(trigger());
    await user.tab();
    expect(screen.getByRole("button", { name: "Fermer" })).toHaveFocus();
    await user.keyboard("{Escape}");

    expect(panel()).toBeNull();
    expect(trigger()).toHaveFocus();
  });
});

describe("ShareButton : copie du lien", () => {
  it("copie le lien dans le presse-papiers et affiche « Copié », sans fermer le panneau", async () => {
    const user = userEvent.setup();
    renderShareButton();
    const writeText = vi.spyOn(navigator.clipboard, "writeText");

    await user.click(trigger());
    await user.click(screen.getByRole("button", { name: "Copier le lien" }));

    expect(await screen.findByRole("button", { name: "Lien copié" })).toHaveTextContent("Copié");
    expect(writeText).toHaveBeenCalledExactlyOnceWith("https://pipecut.app");
    expect(await navigator.clipboard.readText()).toBe("https://pipecut.app");
    expect(screen.getByRole("status")).toHaveTextContent("Lien copié");
    expect(panel()).toBeInTheDocument();
  });

  it("revient à « Copier » à la réouverture du panneau", async () => {
    const user = userEvent.setup();
    renderShareButton();

    await user.click(trigger());
    await user.click(screen.getByRole("button", { name: "Copier le lien" }));
    expect(await screen.findByRole("button", { name: "Lien copié" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Fermer" }));
    await user.click(trigger());

    expect(screen.getByRole("button", { name: "Copier le lien" })).toHaveTextContent("Copier");
    expect(screen.queryByRole("button", { name: "Lien copié" })).toBeNull();
  });

  it("garde « Copier » si le navigateur refuse la copie", async () => {
    const user = userEvent.setup();
    renderShareButton();
    vi.spyOn(navigator.clipboard, "writeText").mockRejectedValueOnce(new Error("refusé"));

    await user.click(trigger());
    await user.click(screen.getByRole("button", { name: "Copier le lien" }));
    await settle();

    expect(screen.getByRole("button", { name: "Copier le lien" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Lien copié" })).toBeNull();
    // le lien est sélectionné dans son champ : il reste à le copier à la main
    expect(screen.getByRole("textbox", { name: "Ou copie le lien" })).toHaveFocus();
    expect(panel()).toBeInTheDocument();
  });
});

describe("ShareButton : partage natif", () => {
  it("ouvre le menu de partage du système sur téléphone, au lieu du panneau", async () => {
    const matchMedia = stubTouchDevice(true);
    const share = stubNativeShare();
    const user = userEvent.setup();
    renderShareButton();

    await user.click(trigger());
    await settle();

    expect(matchMedia).toHaveBeenCalledWith("(hover: none) and (pointer: coarse)");
    expect(share).toHaveBeenCalledExactlyOnceWith({
      title: "PipeCut",
      text: t("share.text"),
      url: "https://pipecut.app",
    });
    expect(panel()).toBeNull();
  });

  it("n'ouvre rien si la personne referme le menu du système sans partager", async () => {
    stubTouchDevice(true);
    const share = stubNativeShare(() => Promise.reject(new DOMException("partage annulé", "AbortError")));
    const user = userEvent.setup();
    renderShareButton();

    await user.click(trigger());
    await settle();

    expect(share).toHaveBeenCalledOnce();
    expect(panel()).toBeNull();
  });

  it("ouvre le panneau si le partage natif échoue", async () => {
    stubTouchDevice(true);
    const share = stubNativeShare(() => Promise.reject(new DOMException("partage refusé", "NotAllowedError")));
    const user = userEvent.setup();
    renderShareButton();

    await user.click(trigger());

    expect(await screen.findByRole("dialog", { name: "Partager PipeCut" })).toBeInTheDocument();
    expect(share).toHaveBeenCalledOnce();
  });

  it("ouvre le panneau sur téléphone quand le navigateur n'a pas de partage natif", async () => {
    stubTouchDevice(true);
    const user = userEvent.setup();
    renderShareButton();

    await user.click(trigger());

    expect(panel()).toBeInTheDocument();
  });

  it("ouvre le panneau sur ordinateur, même si le navigateur a un partage natif", async () => {
    stubTouchDevice(false);
    const share = stubNativeShare();
    const user = userEvent.setup();
    renderShareButton();

    await user.click(trigger());

    expect(panel()).toBeInTheDocument();
    expect(share).not.toHaveBeenCalled();
  });
});
