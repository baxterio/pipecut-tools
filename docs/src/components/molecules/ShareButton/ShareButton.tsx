import { useMemo, useRef } from "react";
import { useCopyToClipboard } from "../../../hooks/useCopyToClipboard";
import { buildShareLinks } from "../../../lib/share";
import { Button } from "../../atoms/Button";
import { Icon } from "../../atoms/Icon";
import { Popover, PopoverAnchor, usePopover } from "../../atoms/Popover";
import { ShareMenu, type ShareMenuLabels, type SharePreview } from "../ShareMenu";
import styles from "./ShareButton.module.css";

interface ShareButtonLabels extends ShareMenuLabels {
  /** Libellé du bouton : « Partager ». */
  button: string;
  /** Titre du panneau. */
  title: string;
  /** Nom accessible de la croix de fermeture. */
  close: string;
}

interface ShareButtonProps {
  labels: ShareButtonLabels;
  /** Ce que les réseaux afficheront pour le lien. Son titre est aussi celui du partage natif. */
  preview: SharePreview;
  /** Adresse partagée : affichée et copiée dans le panneau, transmise aux réseaux et au partage natif. */
  url: string;
  /** Message prérempli, dans la langue de la page. */
  text: string;
}

/**
 * Vrai sur un appareil tactile dont le navigateur propose le partage natif : en pratique, un
 * téléphone ou une tablette. Un ordinateur garde le panneau, même si son navigateur sait partager.
 */
function prefersNativeShare(): boolean {
  return (
    typeof navigator.share === "function" &&
    typeof window.matchMedia === "function" &&
    window.matchMedia("(hover: none) and (pointer: coarse)").matches
  );
}

/**
 * Vrai si la personne a refermé le menu de partage du système sans rien choisir.
 * L'erreur est reconnue à son nom plutôt qu'à sa classe, qui dépend de la fenêtre qui l'a créée.
 */
function isCancelled(error: unknown): boolean {
  return typeof error === "object" && error !== null && "name" in error && error.name === "AbortError";
}

/**
 * Le bouton « Partager » et son panneau. Il a besoin de JavaScript dans le navigateur : il est hydraté
 * comme une île.
 */
export function ShareButton({ labels, preview, url, text }: ShareButtonProps) {
  const menu = usePopover();
  const links = useMemo(() => buildShareLinks(text, url), [text, url]);
  const { copied, copy, reset } = useCopyToClipboard();
  // vrai tant que le menu de partage du système est affiché : un second clic ne fait rien
  const sharing = useRef(false);

  const toggle = async () => {
    if (menu.open) {
      menu.close();
      return;
    }
    // sur téléphone, le menu de partage du système remplace le panneau : il donne accès à Instagram
    if (sharing.current) {
      return;
    }
    if (prefersNativeShare()) {
      sharing.current = true;
      try {
        await navigator.share({ title: preview.title, text, url });
        return;
      } catch (error) {
        if (isCancelled(error)) {
          return;
        }
        // partage natif refusé ou en échec : le panneau prend le relais
      } finally {
        sharing.current = false;
      }
    }
    // le panneau se rouvre toujours dans son état de départ, « Copier »
    reset();
    menu.show();
  };

  return (
    <PopoverAnchor className={styles.share}>
      {/* le nom du bouton ne dépend pas de son libellé, masqué sur écran étroit */}
      <Button {...menu.trigger} variant="ghost" size="sm" aria-label={labels.button} onClick={() => void toggle()}>
        <Icon name="share" size={16} />
        <span className={styles.label}>{labels.button}</span>
      </Button>
      <Popover {...menu.panel} title={labels.title} closeLabel={labels.close}>
        <ShareMenu
          labels={labels}
          preview={preview}
          links={links}
          url={url}
          copied={copied}
          onSelectNetwork={menu.close}
          onCopy={() => copy(url)}
        />
      </Popover>
    </PopoverAnchor>
  );
}
