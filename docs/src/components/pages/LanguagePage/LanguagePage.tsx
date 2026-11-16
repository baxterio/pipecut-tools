import { SITE_NAME } from "../../../lib/site";
import { Logo } from "../../atoms/Logo";
import { type LanguageLink, LanguageNav } from "../../molecules/LanguageNav";
import styles from "./LanguagePage.module.css";

interface LanguagePageProps {
  /** Titre de la liste des langues : « Langue ». */
  label: string;
  languages: readonly LanguageLink[];
}

/**
 * La page de choix de la langue : la marque, puis un lien par langue. C'est ce que la racine du site
 * affiche au navigateur qui n'exécute pas de script, et qu'elle ne peut donc pas envoyer vers sa langue.
 */
export function LanguagePage({ label, languages }: LanguagePageProps) {
  return (
    <main className={styles.page}>
      <p className={styles.brand}>
        <Logo size={44} idPrefix="language-logo" />
        {SITE_NAME}
      </p>
      <LanguageNav label={label} languages={languages} />
    </main>
  );
}
