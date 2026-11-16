import type { CSSProperties } from "react";
import { splitGraphemes } from "../../../lib/text";
import styles from "./TypedSubtitle.module.css";

interface TypedSubtitleProps {
  text: string;
}

/**
 * Mot écrit lettre par lettre dans un bandeau de sous-titre. Le mot est découpé en caractères ici,
 * par script : une seule animation, dont le délai augmente avec le rang `--i` de chaque caractère.
 */
export function TypedSubtitle({ text }: TypedSubtitleProps) {
  return (
    <span className={styles.band} data-typed-subtitle>
      {splitGraphemes(text).map((character, index) => (
        // la clé est le rang : les caractères d'un mot n'ont pas d'autre identité
        <span key={index} className={styles.character} style={{ "--i": index } as CSSProperties} data-character>
          {character}
        </span>
      ))}
    </span>
  );
}
