import styles from "./CutText.module.css";

interface CutTextProps {
  text: string;
}

/**
 * Mot coupé en biais, dessiné deux fois à partir du même texte : la moitié basse, qui reste en place,
 * et la moitié haute, décalée. Seule la moitié basse porte le mot dans le HTML. La moitié haute le
 * reçoit en attribut et la feuille de style le dessine : le texte de la page, celui que lisent les
 * moteurs de recherche, ne contient ainsi le mot qu'une fois.
 */
export function CutText({ text }: CutTextProps) {
  return (
    <span className={styles.cut} data-cut-text>
      <span className={styles.bottom} data-half="bottom">
        {text}
      </span>
      <span className={styles.top} data-half="top" data-text={text} aria-hidden="true" />
    </span>
  );
}
