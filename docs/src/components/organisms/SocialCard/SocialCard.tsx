import type { TitleWords } from "../../../lib/sequence";
import { AnimatedLogo } from "../../atoms/AnimatedLogo";
import { HeroTitle } from "../../molecules/HeroTitle";
import styles from "./SocialCard.module.css";

interface SocialCardProps {
  /** Les trois mots du titre. */
  title: TitleWords;
  /** La première ligne de l'accroche. */
  tagline: string;
}

/**
 * La carte photographiée pour l'image d'aperçu de lien : le logo, le titre et l'accroche du haut de
 * page, dans leur état final. Elle réutilise les composants du haut de page, pour que l'image suive
 * toute retouche de leur dessin.
 */
export function SocialCard({ title, tagline }: SocialCardProps) {
  return (
    <main className={styles.card}>
      <AnimatedLogo />
      <HeroTitle words={title} />
      <p className={styles.tagline}>{tagline}</p>
    </main>
  );
}
