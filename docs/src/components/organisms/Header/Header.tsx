import type { ReactNode } from "react";
import { SITE_NAME, TOP_ANCHOR } from "../../../lib/site";
import { Logo } from "../../atoms/Logo";
import styles from "./Header.module.css";

interface HeaderProps {
  /** Nom accessible du lien de la marque. */
  homeLabel: string;
  /**
   * Les boutons Partager et Télécharger, avec leur menu. Ils sont passés par la page plutôt qu'importés
   * ici : ce sont les deux îles hydratées dans le navigateur, et Astro ne peut les hydrater que s'il les
   * reçoit du fichier de route. Un seul menu est ouvert à la fois : ouvrir l'un ferme l'autre.
   */
  share: ReactNode;
  download: ReactNode;
}

/** En-tête collé en haut au défilement : la marque à gauche, Partager et Télécharger à droite. */
export function Header({ homeLabel, share, download }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <a className={styles.brand} href={`#${TOP_ANCHOR}`} aria-label={homeLabel}>
          <Logo size={26} idPrefix="header-logo" />
          <span>{SITE_NAME}</span>
        </a>
        <div className={styles.actions}>
          {share}
          {download}
        </div>
      </div>
    </header>
  );
}
