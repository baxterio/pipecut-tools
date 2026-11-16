import { type LanguageLink, LanguageNav } from "../../molecules/LanguageNav";
import styles from "./Footer.module.css";

interface FooterProps {
  /** Titre du choix de la langue : « Langue ». */
  languagesLabel: string;
  languages: readonly LanguageLink[];
  /** Code de la langue de la page. */
  current: string;
}

/** Le pied de page : pour l'instant, le choix de la langue. */
export function Footer({ languagesLabel, languages, current }: FooterProps) {
  return (
    <footer className={styles.footer}>
      <LanguageNav label={languagesLabel} languages={languages} current={current} />
    </footer>
  );
}
