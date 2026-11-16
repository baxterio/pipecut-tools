import { readFileSync } from "node:fs";
import { act, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { Popover, PopoverAnchor, PopoverItem } from "./Popover";
import { usePopover } from "./usePopover";

// La feuille de style, lue telle quelle sur le disque. Son chemin passe par une constante : écrit en
// dur dans new URL(), Vite le prendrait pour une ressource à servir.
const STYLESHEET_PATH = "./Popover.module.css";
const stylesheet = readFileSync(new URL(STYLESHEET_PATH, import.meta.url), "utf8");
const TOKENS_PATH = "../../../styles/tokens.css";
const TOKENS = readFileSync(new URL(TOKENS_PATH, import.meta.url), "utf8");

/** Un bouton et son panneau, comme les assemblent les boutons Partager et Télécharger. */
function Menu({ name }: { name: string }) {
  const menu = usePopover();

  return (
    <PopoverAnchor className="menu">
      <button type="button" {...menu.trigger} onClick={menu.toggle}>
        {name}
      </button>
      <Popover {...menu.panel} title={`Menu ${name}`} closeLabel="Fermer">
        <a href="#premier">Premier choix</a>
        <a href="#second">Second choix</a>
      </Popover>
    </PopoverAnchor>
  );
}

function renderMenus() {
  return render(
    <>
      <a href="#avant">Lien précédent</a>
      <Menu name="Partager" />
      <Menu name="Télécharger" />
      <p>Ailleurs dans la page</p>
      <a href="#suite">Lien suivant</a>
    </>
  );
}

const trigger = (name = "Partager") => screen.getByRole("button", { name });
const panel = (name = "Partager") => screen.queryByRole("dialog", { name: `Menu ${name}` });
const cross = () => screen.getByRole("button", { name: "Fermer" });
/** Le panneau en train de disparaître : inerte, il n'est plus un panneau pour les lecteurs d'écran. */
const leavingPanel = () => document.querySelector("[data-leaving][role=dialog]");

describe("Popover : panneau", () => {
  it("est un panneau intitulé, relié à son bouton par une pointe", async () => {
    renderMenus();
    await userEvent.click(trigger());

    expect(trigger()).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger()).toHaveAttribute("aria-controls", panel()?.id);
    expect(document.querySelector("[data-popover-pointer]")).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("link", { name: "Premier choix" })).toBeInTheDocument();
  });

  it("se place par rapport à l'enveloppe du bouton, dont la classe fixe sa largeur et son espacement", async () => {
    renderMenus();
    await userEvent.click(trigger());
    const anchor = panel()?.parentElement;

    expect(anchor).toContainElement(trigger());
    expect(anchor).toHaveClass("menu");
    expect(stylesheet).toMatch(/\.anchor\s*\{[^}]*position:\s*relative/);
    expect(stylesheet).toMatch(/\.panel\s*\{[^}]*gap:\s*var\(--popover-gap\);\s*width:\s*var\(--popover-width\);/);
  });

  it("n'est relié à rien tant qu'il est fermé", () => {
    renderMenus();

    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).not.toHaveAttribute("aria-controls");
  });

  it("a une croix de fermeture de 16 px, dans une cible de 44 × 44 px", async () => {
    renderMenus();
    await userEvent.click(trigger());

    expect(cross().querySelector("svg")).toHaveAttribute("data-icon", "close");
    expect(cross().querySelector("svg")).toHaveAttribute("width", "16");
    expect(stylesheet).toMatch(/\.close\s*\{[^}]*width:\s*var\(--touch-target\);\s*height:\s*var\(--touch-target\);/);
    expect(TOKENS).toMatch(/--touch-target:\s*44px;/);
  });
});

describe("Popover : focus", () => {
  it("place le focus dans le panneau à l'ouverture", async () => {
    renderMenus();
    await userEvent.click(trigger());

    expect(panel()).toHaveFocus();
  });

  it("rend le focus au bouton à la fermeture par la croix", async () => {
    renderMenus();
    await userEvent.click(trigger());
    await userEvent.click(cross());

    expect(panel()).toBeNull();
    expect(trigger()).toHaveFocus();
  });

  it("rend le focus au bouton à la fermeture par la touche Échap", async () => {
    const user = userEvent.setup();
    renderMenus();
    await user.click(trigger());
    await user.tab();
    expect(cross()).toHaveFocus();
    await user.keyboard("{Escape}");

    expect(panel()).toBeNull();
    expect(trigger()).toHaveFocus();
  });

  it("se ferme quand la tabulation en sort, sans rappeler le focus", async () => {
    const user = userEvent.setup();
    renderMenus();
    await user.click(trigger());
    // la croix, puis les deux choix : le panneau reste ouvert
    for (let step = 0; step < 3; step++) {
      await user.tab();
      expect(panel()).toBeInTheDocument();
    }
    await user.tab();

    expect(panel()).toBeNull();
    expect(trigger("Télécharger")).toHaveFocus();
  });

  it("reste ouvert quand la tabulation revient sur le bouton, et se ferme quand elle le quitte", async () => {
    const user = userEvent.setup();
    renderMenus();
    await user.click(trigger());
    await user.tab();
    await user.tab({ shift: true });

    expect(trigger()).toHaveFocus();
    expect(panel()).toBeInTheDocument();

    await user.tab({ shift: true });

    expect(screen.getByRole("link", { name: "Lien précédent" })).toHaveFocus();
    expect(panel()).toBeNull();
  });
});

describe("Popover : fermeture", () => {
  it("se ferme à l'appui à l'extérieur", async () => {
    renderMenus();
    await userEvent.click(trigger());
    await userEvent.click(screen.getByText("Ailleurs dans la page"));

    expect(panel()).toBeNull();
  });

  it("reste ouvert à l'appui à l'intérieur", async () => {
    renderMenus();
    await userEvent.click(trigger());
    await userEvent.click(screen.getByText("Menu Partager"));

    expect(panel()).toBeInTheDocument();
  });

  it("ne prend pas un appui sur son bouton pour un appui à l'extérieur : le bouton le referme lui-même", async () => {
    renderMenus();
    await userEvent.click(trigger());
    await userEvent.click(trigger());

    expect(panel()).toBeNull();
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
  });
});

describe("Popover : un seul panneau ouvert à la fois", () => {
  it("ferme l'autre panneau en s'ouvrant, et prend le focus", async () => {
    renderMenus();
    await userEvent.click(trigger("Partager"));
    await userEvent.click(trigger("Télécharger"));

    expect(panel("Partager")).toBeNull();
    expect(panel("Télécharger")).toHaveFocus();
  });

  // Une activation sans appui ni déplacement du focus (lecteur d'écran, script) ne passe ni par
  // l'appui à l'extérieur ni par la sortie du focus : c'est l'ouverture elle-même qui ferme l'autre.
  it("ferme l'autre panneau même sans appui ni déplacement du focus", () => {
    renderMenus();
    fireEvent.click(trigger("Partager"));
    (document.activeElement as HTMLElement).blur();
    fireEvent.click(trigger("Télécharger"));

    expect(panel("Partager")).toBeNull();
    expect(panel("Télécharger")).toBeInTheDocument();
  });
});

/** Donne au navigateur de test une animation de sortie, qui se termine quand on le décide. */
function stubLeaveAnimation() {
  const { promise: finished, resolve: finish } = Promise.withResolvers<void>();
  Object.defineProperty(Element.prototype, "getAnimations", { value: vi.fn(() => [{ finished }]), configurable: true });
  return () => act(async () => finish());
}

describe("Popover : apparition et disparition en douceur", () => {
  afterEach(() => {
    Reflect.deleteProperty(Element.prototype, "getAnimations");
  });

  it("anime l'entrée et la sortie du panneau et de sa pointe, sauf en mouvement réduit", () => {
    const reduced = stylesheet.slice(stylesheet.indexOf("@media (prefers-reduced-motion: reduce)"));

    expect(stylesheet).toMatch(/\.panel,\s*\.pointer\s*\{\s*animation:\s*popover-in /);
    expect(stylesheet).toMatch(/\.panel\[data-leaving\],\s*\.pointer\[data-leaving\]\s*\{\s*animation:\s*popover-out /);
    // la sortie est citée elle aussi : son sélecteur, plus précis, l'emporterait sur une règle plus courte
    expect(reduced).toMatch(
      /\.panel,\s*\.pointer,\s*\.panel\[data-leaving\],\s*\.pointer\[data-leaving\]\s*\{\s*animation:\s*none/
    );
  });

  it("garde le panneau affiché le temps de son animation de sortie, puis le retire", async () => {
    const finishAnimation = stubLeaveAnimation();
    renderMenus();
    await userEvent.click(trigger());
    await userEvent.click(cross());

    // fermé pour le bouton et pour le focus, mais encore à l'écran
    expect(trigger()).toHaveAttribute("aria-expanded", "false");
    expect(trigger()).toHaveFocus();
    expect(leavingPanel()).toHaveAttribute("data-leaving");
    expect(document.querySelector("[data-popover-pointer]")).toHaveAttribute("data-leaving");

    await finishAnimation();

    expect(leavingPanel()).toBeNull();
    expect(document.querySelector("[data-popover-pointer]")).toBeNull();
  });

  it("est inerte pendant sa sortie : la tabulation n'y entre plus, les lecteurs d'écran ne le lisent plus", async () => {
    const finishAnimation = stubLeaveAnimation();
    renderMenus();
    await userEvent.click(trigger());
    await userEvent.click(cross());

    expect(leavingPanel()).toHaveAttribute("inert");
    // le focus a été rendu au bouton avant que le panneau ne devienne inerte
    expect(trigger()).toHaveFocus();

    await finishAnimation();
  });

  it("ne réagit plus à rien pendant sa sortie", async () => {
    const finishAnimation = stubLeaveAnimation();
    const user = userEvent.setup();
    renderMenus();
    await user.click(trigger());
    await user.click(cross());
    await user.keyboard("{Escape}");
    await user.click(screen.getByText("Ailleurs dans la page"));

    expect(leavingPanel()).toHaveAttribute("data-leaving");

    await finishAnimation();

    expect(leavingPanel()).toBeNull();
  });

  it("reste en place s'il est rouvert avant la fin de sa sortie", async () => {
    const finishAnimation = stubLeaveAnimation();
    renderMenus();
    await userEvent.click(trigger());
    await userEvent.click(cross());
    await userEvent.click(trigger());

    expect(panel()).not.toHaveAttribute("data-leaving");
    expect(panel()).not.toHaveAttribute("inert");
    expect(panel()).toHaveFocus();

    await finishAnimation();

    expect(panel()).toBeInTheDocument();
    expect(trigger()).toHaveAttribute("aria-expanded", "true");
  });
});

describe("PopoverItem", () => {
  it("est un vrai lien, qui ajoute la classe du menu au style commun des rangées", () => {
    render(
      <PopoverItem className="choix" href="#fichier" target="_blank">
        Pour Mac
      </PopoverItem>
    );
    const link = screen.getByRole("link", { name: "Pour Mac" });

    expect(link).toHaveAttribute("href", "#fichier");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveClass("choix");
    expect(link.classList).toHaveLength(2);
    expect(link.className).not.toContain("undefined");
    expect(stylesheet).toMatch(/\.item:hover\s*\{\s*background:\s*var\(--color-panel-button-hover\)/);
  });
});
