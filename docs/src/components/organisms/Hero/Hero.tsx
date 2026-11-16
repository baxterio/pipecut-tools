import type { CSSProperties } from "react";
import { type Timeline, type TitleWords, toCssVariables } from "../../../lib/sequence";
import { AnimatedLogo } from "../../atoms/AnimatedLogo";
import { Icon } from "../../atoms/Icon";
import { TextLink } from "../../atoms/TextLink";
import { type Download, DownloadButtons } from "../../molecules/DownloadButtons";
import { HeroTitle } from "../../molecules/HeroTitle";
import { Requirements } from "../../molecules/Requirements";
import styles from "./Hero.module.css";

interface HeroProps {
  /** Les trois mots du titre. */
  title: TitleWords;
  /** L'accroche, une ligne par élément. */
  tagline: readonly string[];
  /** Timeline de la séquence, calculée au build à partir des mots du titre. */
  timeline: Timeline;
  /** Ancre du bloc des boutons de téléchargement. */
  downloadId: string;
  /** Les fichiers d'installation, un par système. */
  downloads: readonly Download[];
  /** « Gratuit · Sans compte » */
  free: string;
  /** Configuration requise. */
  requirements: string;
  /** Le lien vers la vidéo de présentation. */
  video: { label: string; href: string };
}

/**
 * Le haut de page. La timeline est posée en variables CSS sur la section : le logo, le titre et le
 * reste du contenu lisent ces mêmes variables, et leurs animations partent toutes au chargement de
 * la page, sur la même horloge.
 */
export function Hero({ title, tagline, timeline, downloadId, downloads, free, requirements, video }: HeroProps) {
  return (
    <section className={styles.hero} style={toCssVariables(timeline) as CSSProperties} data-sequence>
      <AnimatedLogo />
      <HeroTitle words={title} />
      <div className={styles.content} data-sequence-content>
        <p className={styles.tagline}>
          {tagline.map((line) => (
            <span key={line} className={styles.taglineLine}>
              {line}
            </span>
          ))}
        </p>
        <div className={styles.downloads}>
          <DownloadButtons id={downloadId} downloads={downloads} />
        </div>
        <Requirements free={free} requirements={requirements} />
        <div className={styles.video}>
          <TextLink href={video.href} icon={<Icon name="play" size={14} />}>
            {video.label}
          </TextLink>
        </div>
      </div>
    </section>
  );
}
