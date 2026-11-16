import {
  type AnchorHTMLAttributes,
  type ReactNode,
  type RefObject,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { Icon } from "../Icon";
import styles from "./Popover.module.css";

/**
 * Événement émis par un panneau qui s'ouvre, pour que les autres se ferment : un seul menu est ouvert
 * à la fois. Il passe par le document, car chaque menu du header est une île React séparée, sans état
 * commun avec les autres.
 */
const OPEN_EVENT = "pipecut:popover-open";

interface PopoverProps {
  id: string;
  /** Vrai quand le panneau est ouvert. Fermé, il reste affiché le temps de son animation de sortie. */
  open: boolean;
  title: string;
  /** Nom accessible de la croix de fermeture. */
  closeLabel: string;
  /**
   * Le bouton qui ouvre le panneau. Un appui dessus n'est pas « à l'extérieur », et le focus lui revient
   * à la fermeture. Le panneau se place sous lui : tous deux sont dans un même PopoverAnchor.
   */
  anchor: RefObject<HTMLElement | null>;
  /** Demande de fermeture : croix, touche Échap, appui à l'extérieur, focus parti ailleurs, autre panneau ouvert. */
  onClose: () => void;
  children: ReactNode;
}

interface PopoverAnchorProps {
  /**
   * Classe du menu : elle fixe la largeur du panneau (`--popover-width`, bordure comprise) et
   * l'espacement de ses blocs (`--popover-gap`).
   */
  className: string;
  /** Le bouton, puis son Popover. */
  children: ReactNode;
}

/** Enveloppe d'un bouton et de son panneau : le repère par rapport auquel le panneau et sa pointe se placent. */
export function PopoverAnchor({ className, children }: PopoverAnchorProps) {
  return <div className={`${styles.anchor} ${className}`}>{children}</div>;
}

interface PopoverItemProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href"> {
  href: string;
  /** Classe du menu : elle fixe les dimensions de la rangée. */
  className: string;
  children: ReactNode;
}

/** Rangée cliquable d'un panneau : un lien au fond plus clair que le panneau, qui s'éclaircit au survol. */
export function PopoverItem({ className, children, ...rest }: PopoverItemProps) {
  return (
    <a {...rest} className={`${styles.item} ${className}`}>
      {children}
    </a>
  );
}

/**
 * Panneau ancré sous un bouton, avec sa pointe, son titre et sa croix de fermeture. C'est le bouton qui
 * décide de l'ouvrir, et qui le ferme quand `onClose` est appelé (cf. usePopover). Le panneau apparaît
 * et disparaît en douceur : il n'est dans la page que le temps d'être ouvert, puis de jouer son
 * animation de sortie.
 */
export function Popover({ open, ...panel }: PopoverProps) {
  const [mounted, setMounted] = useState(open);
  if (open && !mounted) {
    setMounted(true);
  }
  const unmount = useCallback(() => setMounted(false), []);

  if (!open && !mounted) {
    return null;
  }
  return <PopoverPanel {...panel} leaving={!open} onLeft={unmount} />;
}

interface PopoverPanelProps extends Omit<PopoverProps, "open"> {
  /** Vrai pendant l'animation de sortie : le panneau est fermé, mais encore affiché. */
  leaving: boolean;
  /** L'animation de sortie est terminée : le panneau peut quitter la page. */
  onLeft: () => void;
}

function PopoverPanel({ id, title, closeLabel, anchor, onClose, children, leaving, onLeft }: PopoverPanelProps) {
  const panel = useRef<HTMLDivElement>(null);
  const titleId = `${id}-title`;

  // À l'ouverture, le focus entre dans le panneau, et les autres panneaux se ferment.
  useLayoutEffect(() => {
    if (leaving) {
      return;
    }
    panel.current?.focus({ preventScroll: true });
    panel.current?.dispatchEvent(new CustomEvent(OPEN_EVENT, { bubbles: true }));
  }, [leaving]);

  // À la fermeture, le focus revient au bouton, sans attendre la fin de l'animation de sortie. S'il est
  // déjà parti ailleurs (tabulation hors du panneau, autre menu ouvert), on ne le rappelle pas.
  // Le panneau quitte ensuite la page à la fin de son animation. Sans animation (mouvement réduit), il
  // la quitte aussitôt. Rouvert avant la fin, il reste en place.
  //
  // Le focus est rendu ici, une fois la page mise à jour, et non dans le nettoyage de l'effet
  // précédent : React rétablit après chaque mise à jour le focus qu'il avait trouvé avant elle, et
  // le ramènerait dans le panneau, qui est encore dans la page.
  //
  // Le panneau devient ensuite inerte, le temps de sa sortie : ni la tabulation ni un clic ne peuvent
  // plus y entrer, et les lecteurs d'écran ne le lisent plus. L'attribut est posé ici, après le retour
  // du focus : posé plus tôt, il aurait fait perdre le focus avant qu'on sache où il était.
  useLayoutEffect(() => {
    if (!leaving) {
      return;
    }
    const element = panel.current;
    if (element?.contains(document.activeElement)) {
      anchor.current?.focus({ preventScroll: true });
    }
    element?.setAttribute("inert", "");
    const animations = element?.getAnimations?.() ?? [];
    if (animations.length === 0) {
      onLeft();
      return;
    }
    let reopened = false;
    void Promise.allSettled(animations.map((animation) => animation.finished)).then(() => {
      if (!reopened) {
        onLeft();
      }
    });
    return () => {
      reopened = true;
      element?.removeAttribute("inert");
    };
  }, [anchor, leaving, onLeft]);

  // un panneau en train de disparaître n'écoute plus rien
  useEffect(() => {
    if (leaving) {
      return;
    }
    const element = panel.current;
    const button = anchor.current;
    const isInside = (target: Node) => element?.contains(target) === true || button?.contains(target) === true;

    const closeOnOutsidePress = (event: PointerEvent) => {
      if (event.target instanceof Node && !isInside(event.target)) {
        onClose();
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };
    // le focus part ailleurs dans la page (tabulation au-delà du panneau) : le panneau se ferme, pour
    // ne pas laisser le focus sur un élément caché derrière lui
    const closeOnFocusLeave = (event: FocusEvent) => {
      if (event.relatedTarget instanceof Node && !isInside(event.relatedTarget)) {
        onClose();
      }
    };
    const closeForAnotherPopover = (event: Event) => {
      if (event.target !== element) {
        onClose();
      }
    };

    document.addEventListener("pointerdown", closeOnOutsidePress);
    document.addEventListener("keydown", closeOnEscape);
    document.addEventListener(OPEN_EVENT, closeForAnotherPopover);
    element?.addEventListener("focusout", closeOnFocusLeave);
    button?.addEventListener("focusout", closeOnFocusLeave);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsidePress);
      document.removeEventListener("keydown", closeOnEscape);
      document.removeEventListener(OPEN_EVENT, closeForAnotherPopover);
      element?.removeEventListener("focusout", closeOnFocusLeave);
      button?.removeEventListener("focusout", closeOnFocusLeave);
    };
  }, [anchor, leaving, onClose]);

  // repère des styles de l'animation de sortie
  const leavingMark = leaving ? "" : undefined;

  return (
    <>
      <span className={styles.pointer} aria-hidden="true" data-popover-pointer="" data-leaving={leavingMark} />
      <div
        id={id}
        ref={panel}
        className={styles.panel}
        data-leaving={leavingMark}
        role="dialog"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <div className={styles.header}>
          <p id={titleId} className={styles.title}>
            {title}
          </p>
          <button type="button" className={styles.close} aria-label={closeLabel} onClick={onClose}>
            <Icon name="close" size={16} />
          </button>
        </div>
        {children}
      </div>
    </>
  );
}
