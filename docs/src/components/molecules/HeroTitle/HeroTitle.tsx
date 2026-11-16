import type { TitleWords } from "../../../lib/sequence";
import { CutText } from "../../atoms/CutText";
import { FillText } from "../../atoms/FillText";
import { TypedSubtitle } from "../../atoms/TypedSubtitle";
import styles from "./HeroTitle.module.css";

interface HeroTitleProps {
  words: TitleWords;
}

/**
 * Le titre de la page : trois mots, toujours sur trois lignes. Les lecteurs d'écran lisent le nom
 * du titre (« Télécharge. Découpe. Sous-titre. ») : les lignes animées, où un mot est dessiné deux
 * fois et un autre découpé en lettres, leur sont masquées.
 *
 * Une espace sépare les lignes dans le HTML : sans effet à l'écran, elle fait que le texte du titre,
 * celui que lisent les moteurs de recherche, se lit lui aussi « Télécharge. Découpe. Sous-titre. ».
 */
export function HeroTitle({ words }: HeroTitleProps) {
  return (
    <h1 className={styles.title} aria-label={`${words.download} ${words.cut} ${words.subtitle}`}>
      <span className={styles.line} aria-hidden="true">
        <FillText text={words.download} />
      </span>{" "}
      <span className={styles.line} aria-hidden="true">
        <CutText text={words.cut} />
      </span>{" "}
      <span className={styles.line} aria-hidden="true">
        <TypedSubtitle text={words.subtitle} />
      </span>
    </h1>
  );
}
