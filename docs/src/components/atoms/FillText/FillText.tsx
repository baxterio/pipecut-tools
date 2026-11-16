import styles from "./FillText.module.css";

interface FillTextProps {
  text: string;
}

/**
 * Mot rempli de gauche à droite. Le remplissage est un fond peint derrière le texte, en pourcentage
 * de sa largeur : il fonctionne avec n'importe quel mot, dans toutes les langues.
 */
export function FillText({ text }: FillTextProps) {
  return (
    <span className={styles.fill} data-fill-text>
      {text}
    </span>
  );
}
