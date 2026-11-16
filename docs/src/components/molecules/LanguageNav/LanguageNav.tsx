import { useId } from "react";
import { Icon } from "../../atoms/Icon";
import styles from "./LanguageNav.module.css";

export interface LanguageLink {
  /** Code de la langue : « fr », « en-GB ». Il renseigne aussi la langue du lien, pour les lecteurs d'écran. */
  code: string;
  /** Nom de la langue, écrit dans cette langue. */
  name: string;
  /** Adresse de la page dans cette langue. */
  href: string;
}

interface LanguageNavProps {
  /** Titre de la liste : « Langue ». */
  label: string;
  languages: readonly LanguageLink[];
  /** Code de la langue de la page : son lien est signalé comme la page en cours. */
  current?: string;
}

/**
 * Le choix de la langue : un lien par langue, vers la même page. Ce sont de vrais liens, qui
 * fonctionnent sans JavaScript et que les moteurs de recherche suivent.
 */
export function LanguageNav({ label, languages, current }: LanguageNavProps) {
  const labelId = useId();

  return (
    <nav className={styles.nav} aria-labelledby={labelId}>
      <p id={labelId} className={styles.label}>
        <Icon name="globe" size={14} />
        {label}
      </p>
      <ul className={styles.list}>
        {languages.map((language) => (
          <li key={language.code}>
            <a
              className={styles.link}
              href={language.href}
              lang={language.code}
              hrefLang={language.code}
              aria-current={language.code === current ? "page" : undefined}
            >
              {language.name}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
