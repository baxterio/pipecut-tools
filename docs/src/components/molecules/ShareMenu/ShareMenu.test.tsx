import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { shareLabels, translator } from "../../../i18n";
import { buildShareLinks } from "../../../lib/share";
import { SITE_URL } from "../../../lib/site";
import { ShareMenu } from "./ShareMenu";

const t = translator("fr");
const links = buildShareLinks(t("share.text"), SITE_URL);
const preview = { title: "PipeCut", description: t("hero.tagline.promise"), domain: "pipecut.app" };

function renderMenu(props: Partial<Parameters<typeof ShareMenu>[0]> = {}) {
  const handlers = { onSelectNetwork: vi.fn(), onCopy: vi.fn(async () => true) };
  const view = render(
    <ShareMenu
      labels={shareLabels(t)}
      preview={preview}
      links={links}
      url={SITE_URL}
      copied={false}
      {...handlers}
      {...props}
    />
  );
  return { ...handlers, ...view };
}

const field = () => screen.getByRole("textbox", { name: "Ou copie le lien" });

describe("ShareMenu : aperçu", () => {
  it("montre l'aperçu du partage : le logo, le nom, l'accroche et le domaine", () => {
    const { container } = renderMenu();

    expect(screen.getByText("PipeCut")).toBeInTheDocument();
    expect(screen.getByText("Le bon extrait, au bon format, prêt à poster.")).toBeInTheDocument();
    expect(screen.getByText("pipecut.app")).toBeInTheDocument();
    expect(container.querySelector("svg[width='44']")).not.toBeNull();
  });
});

describe("ShareMenu : réseaux", () => {
  it("liste les six réseaux sous « Sur les réseaux », chacun ouvert dans un nouvel onglet", () => {
    renderMenu();
    const networkLinks = within(screen.getByRole("list", { name: "Sur les réseaux" })).getAllByRole("link");

    expect(networkLinks.map((link) => link.textContent)).toEqual([
      "X (nouvel onglet)",
      "Bluesky (nouvel onglet)",
      "Facebook (nouvel onglet)",
      "WhatsApp (nouvel onglet)",
      "LinkedIn (nouvel onglet)",
      "Telegram (nouvel onglet)",
    ]);
    networkLinks.forEach((link, index) => {
      expect(link).toHaveAttribute("href", links[index]?.href);
      expect(link).toHaveAttribute("target", "_blank");
      expect(link).toHaveAttribute("rel", "noopener noreferrer");
    });
  });

  it("donne à chaque réseau son icône officielle, sur une pastille à sa couleur", () => {
    renderMenu();

    screen.getAllByRole("link").forEach((link, index) => {
      const icon = link.querySelector("[data-network]");

      expect(icon).toHaveAttribute("data-network", links[index]?.id);
      expect(icon?.querySelector("svg")).toHaveAttribute("data-icon", links[index]?.id);
    });
  });

  it("prévient quand un réseau est choisi", async () => {
    const { onSelectNetwork } = renderMenu();
    // jsdom ne navigue pas : le clic ne fait qu'appeler le gestionnaire
    await userEvent.click(screen.getByRole("link", { name: /Bluesky/ }));

    expect(onSelectNetwork).toHaveBeenCalledOnce();
  });
});

describe("ShareMenu : copie du lien", () => {
  it("affiche le lien dans un champ en lecture seule", () => {
    renderMenu();

    expect(field()).toHaveValue("https://pipecut.app");
    expect(field()).toHaveAttribute("readonly");
  });

  it("affiche l'adresse reçue, quelle que soit la langue", () => {
    renderMenu({ url: "https://pipecut.app/en/" });

    expect(field()).toHaveValue("https://pipecut.app/en/");
  });

  it("propose « Copier », lu « Copier le lien »", async () => {
    const { onCopy } = renderMenu();
    const button = screen.getByRole("button", { name: "Copier le lien" });

    expect(button).toHaveTextContent(/^Copier$/);
    expect(button.querySelector("svg")).toBeNull();
    await userEvent.click(button);
    expect(onCopy).toHaveBeenCalledOnce();
  });

  it("sélectionne le lien dans son champ si la copie est refusée, pour le copier à la main", async () => {
    renderMenu({ onCopy: vi.fn(async () => false) });
    const input = field() as HTMLInputElement;

    await userEvent.click(screen.getByRole("button", { name: "Copier le lien" }));

    expect(input).toHaveFocus();
    expect(input.value.slice(input.selectionStart ?? 0, input.selectionEnd ?? 0)).toBe("https://pipecut.app");
  });

  it("laisse le focus sur le bouton quand la copie réussit", async () => {
    renderMenu();
    const button = screen.getByRole("button", { name: "Copier le lien" });

    await userEvent.click(button);

    expect(button).toHaveFocus();
  });

  it("n'annonce rien tant que le lien n'est pas copié", () => {
    renderMenu();

    expect(screen.getByRole("status")).toBeEmptyDOMElement();
    expect(field().className).not.toMatch(/fieldCopied/);
  });

  it("passe à « Copié » avec une coche et un champ bordé de vert, et l'annonce", () => {
    renderMenu({ copied: true });
    const button = screen.getByRole("button", { name: "Lien copié" });

    expect(button).toHaveTextContent(/^Copié$/);
    expect(button.querySelector("svg")).toHaveAttribute("data-icon", "check");
    expect(button.className).toMatch(/copied/);
    expect(field().className).toMatch(/fieldCopied/);
    expect(screen.queryByRole("button", { name: "Copier le lien" })).toBeNull();
    expect(screen.getByRole("status")).toHaveTextContent("Lien copié");
  });
});
