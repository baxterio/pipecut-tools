import { Button } from "../../atoms/Button";
import { Icon } from "../../atoms/Icon";
import styles from "./DownloadButtons.module.css";

export interface Download {
  label: string;
  /** Lien direct vers le fichier d'installation. */
  href: string;
}

interface DownloadButtonsProps {
  /** Ancre du bloc : un lien vers elle mène aux boutons. */
  id: string;
  /** Les fichiers d'installation, un par système, dans l'ordre d'affichage. */
  downloads: readonly Download[];
}

/** Les boutons de téléchargement, à égalité : aucun système n'est mis en avant. */
export function DownloadButtons({ id, downloads }: DownloadButtonsProps) {
  return (
    <div id={id} className={styles.buttons}>
      {downloads.map((download) => (
        <Button key={download.href} href={download.href} variant="accent" size="lg">
          <Icon name="download" size={19} />
          {download.label}
        </Button>
      ))}
    </div>
  );
}
