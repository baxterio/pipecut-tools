import { Button } from "../../atoms/Button";
import { Icon } from "../../atoms/Icon";
import { Popover, PopoverAnchor, usePopover } from "../../atoms/Popover";
import { type DownloadChoice, DownloadMenu } from "../DownloadMenu";
import styles from "./DownloadMenuButton.module.css";

interface DownloadMenuButtonProps {
  /** Libellé du bouton : « Télécharger ». */
  label: string;
  /** Titre du panneau. */
  title: string;
  /** Nom accessible de la croix de fermeture. */
  closeLabel: string;
  /** Les fichiers d'installation, un par système. */
  choices: readonly DownloadChoice[];
  /** Mentions sous les choix : « Gratuit · Sans compte », suivies du numéro de version quand il est connu. */
  mentions: string;
}

/**
 * Le bouton « Télécharger » du header et son panneau. Il a besoin de JavaScript dans le navigateur :
 * il est hydraté comme une île.
 */
export function DownloadMenuButton({ label, title, closeLabel, choices, mentions }: DownloadMenuButtonProps) {
  const menu = usePopover();

  return (
    <PopoverAnchor className={styles.download}>
      <Button {...menu.trigger} variant="accent" size="sm" onClick={menu.toggle}>
        {label}
        <Icon name="chevron" size={14} className={styles.chevron} />
      </Button>
      <Popover {...menu.panel} title={title} closeLabel={closeLabel}>
        <DownloadMenu choices={choices} mentions={mentions} onSelect={menu.close} />
      </Popover>
    </PopoverAnchor>
  );
}
