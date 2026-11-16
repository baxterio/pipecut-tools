import { useId, useRef } from "react";
import type { ShareLink, ShareNetworkId } from "../../../lib/share";
import { Icon } from "../../atoms/Icon";
import { Logo } from "../../atoms/Logo";
import { PopoverItem } from "../../atoms/Popover";
import styles from "./ShareMenu.module.css";

export interface ShareMenuLabels {
  /** Petits titres des deux blocs : les réseaux, puis le lien à copier. */
  networks: string;
  copyHeading: string;
  /** Libellés affichés sur le bouton de copie, avant et après le clic. */
  copy: string;
  copied: string;
  /** Noms accessibles du même bouton, plus explicites, et annonce faite après la copie. */
  copyLink: string;
  linkCopied: string;
  /** Précision lue par les lecteurs d'écran sur les liens qui ouvrent un onglet : « (nouvel onglet) ». */
  newTab: string;
}

/** Ce que les réseaux afficheront pour le lien partagé. */
export interface SharePreview {
  title: string;
  description: string;
  domain: string;
}

interface ShareMenuProps {
  labels: ShareMenuLabels;
  preview: SharePreview;
  links: ShareLink[];
  /** Adresse affichée dans le champ, et copiée par le bouton. */
  url: string;
  /** Vrai après une copie réussie : champ bordé de vert, bouton vert « Copié ». */
  copied: boolean;
  onSelectNetwork: () => void;
  /** Copie le lien. Renvoie faux si le navigateur refuse l'accès au presse-papiers. */
  onCopy: () => Promise<boolean>;
}

/**
 * Côté de chaque glyphe dans sa pastille de 26 px. Les glyphes n'occupent pas tous la même part de
 * leur boîte de dessin : ces tailles leur donnent le même poids à l'œil.
 */
const GLYPH_SIZE: Record<ShareNetworkId, number> = {
  x: 13,
  bluesky: 15,
  facebook: 18,
  whatsapp: 16,
  linkedin: 19,
  telegram: 25,
};

/** Le contenu du panneau Partager : l'aperçu du partage, les réseaux et le lien à copier. */
export function ShareMenu({ labels, preview, links, url, copied, onSelectNetwork, onCopy }: ShareMenuProps) {
  const field = useRef<HTMLInputElement>(null);
  const id = useId();
  const networksId = `${id}-networks`;
  const copyId = `${id}-copy`;

  // copie refusée par le navigateur : le lien est sélectionné dans son champ, prêt à être copié à la main
  const copyOrSelect = async () => {
    const done = await onCopy();
    if (!done) {
      field.current?.focus({ preventScroll: true });
      field.current?.select();
    }
  };

  return (
    <>
      <div className={styles.preview}>
        <Logo size={44} idPrefix="share-logo" />
        <div className={styles.previewText}>
          <span className={styles.previewTitle}>{preview.title}</span>
          <span className={styles.previewDescription}>{preview.description}</span>
          <span className={styles.previewDomain}>{preview.domain}</span>
        </div>
      </div>

      <div className={styles.block}>
        <p id={networksId} className={styles.label}>
          {labels.networks}
        </p>
        <ul className={styles.networks} aria-labelledby={networksId}>
          {links.map((link) => (
            <li key={link.id}>
              <PopoverItem
                className={styles.network}
                href={link.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={onSelectNetwork}
              >
                <span className={styles.networkIcon} data-network={link.id}>
                  <Icon name={link.id} size={GLYPH_SIZE[link.id]} />
                </span>
                <span className={styles.networkName}>
                  {link.name}
                  <span className={styles.visuallyHidden}> {labels.newTab}</span>
                </span>
              </PopoverItem>
            </li>
          ))}
        </ul>
      </div>

      <div className={styles.block}>
        <p id={copyId} className={styles.label}>
          {labels.copyHeading}
        </p>
        <div className={styles.copyRow}>
          <input
            ref={field}
            className={copied ? `${styles.field} ${styles.fieldCopied}` : styles.field}
            type="text"
            readOnly
            value={url}
            aria-labelledby={copyId}
            onFocus={(event) => event.currentTarget.select()}
          />
          <button
            type="button"
            className={copied ? `${styles.copy} ${styles.copied}` : styles.copy}
            aria-label={copied ? labels.linkCopied : labels.copyLink}
            onClick={() => void copyOrSelect()}
          >
            {copied && <Icon name="check" size={16} />}
            {copied ? labels.copied : labels.copy}
          </button>
        </div>
      </div>

      {/* annonce la copie aux lecteurs d'écran, sans déplacer le focus */}
      <span role="status" className={styles.visuallyHidden}>
        {copied ? labels.linkCopied : ""}
      </span>
    </>
  );
}
