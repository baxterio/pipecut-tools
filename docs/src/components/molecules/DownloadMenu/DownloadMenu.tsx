import { Icon } from "../../atoms/Icon";
import { PopoverItem } from "../../atoms/Popover";
import styles from "./DownloadMenu.module.css";

export interface DownloadChoice {
  /** Le système : « Pour Mac ». */
  label: string;
  /** Ce qu'il faut pour l'installer : « Puce Apple (M1 et plus récents) ». */
  requirement: string;
  /** Lien direct vers le fichier d'installation. */
  href: string;
}

interface DownloadMenuProps {
  /** Les fichiers d'installation, un par système, dans l'ordre d'affichage. */
  choices: readonly DownloadChoice[];
  /** « Gratuit · Sans compte », suivi du numéro de version de l'app quand il est connu. */
  mentions: string;
  onSelect: () => void;
}

/** Le contenu du panneau Télécharger : les systèmes, à égalité, puis les mentions. */
export function DownloadMenu({ choices, mentions, onSelect }: DownloadMenuProps) {
  return (
    <>
      <ul className={styles.choices}>
        {choices.map((choice) => (
          <li key={choice.href}>
            <PopoverItem className={styles.choice} href={choice.href} onClick={onSelect}>
              <span className={styles.icon}>
                <Icon name="download" size={16} />
              </span>
              <span className={styles.text}>
                <span className={styles.label}>{choice.label}</span>
                <span className={styles.requirement}>{choice.requirement}</span>
              </span>
            </PopoverItem>
          </li>
        ))}
      </ul>
      <p className={styles.mentions}>{mentions}</p>
    </>
  );
}
