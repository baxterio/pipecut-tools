import {
  LOGO_FULL_TRIANGLE,
  LOGO_MASK_BOX,
  LOGO_MASK_STROKE,
  LOGO_SMALL_TRIANGLE,
  LOGO_SQUARE,
  LOGO_STROKE,
  MASK_HIDDEN,
  MASK_SHOWN,
} from "../../../lib/logo";
import styles from "./Logo.module.css";

/*
 * Les formes du logo, à placer dans un <svg> à la boîte de vue du logo. Le logo statique les réunit
 * dans un seul dessin ; le logo animé en met une par calque.
 */

interface LogoBackgroundProps {
  /** Identifiant du dégradé : unique dans la page. */
  gradientId: string;
}

/** Le carré arrondi du fond, et son dégradé. */
export function LogoBackground({ gradientId }: LogoBackgroundProps) {
  return (
    <>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" className={styles.gradientStart} />
          <stop offset="1" className={styles.gradientEnd} />
        </linearGradient>
      </defs>
      <rect
        x={LOGO_SQUARE.x}
        y={LOGO_SQUARE.y}
        width={LOGO_SQUARE.size}
        height={LOGO_SQUARE.size}
        rx={LOGO_SQUARE.radius}
        fill={`url(#${gradientId})`}
      />
    </>
  );
}

interface LogoCutPartProps {
  /** Identifiant du masque : unique dans la page. */
  maskId: string;
}

/** La partie coupée : le grand triangle, rose, dont le masque retire le petit triangle et son pourtour. */
export function LogoCutPart({ maskId }: LogoCutPartProps) {
  return (
    <>
      <defs>
        <mask id={maskId} maskUnits="userSpaceOnUse" {...LOGO_MASK_BOX}>
          <rect {...LOGO_MASK_BOX} fill={MASK_SHOWN} />
          <polygon
            points={LOGO_SMALL_TRIANGLE}
            fill={MASK_HIDDEN}
            stroke={MASK_HIDDEN}
            strokeWidth={LOGO_MASK_STROKE}
            strokeLinejoin="round"
          />
        </mask>
      </defs>
      <g mask={`url(#${maskId})`}>
        <polygon
          className={styles.cutPart}
          points={LOGO_FULL_TRIANGLE}
          strokeWidth={LOGO_STROKE}
          strokeLinejoin="round"
        />
      </g>
    </>
  );
}

interface LogoTriangleProps {
  /** `small` : ce qui reste du triangle « lecture » une fois coupé. `full` : le triangle entier, avant la coupe. */
  shape: "small" | "full";
}

/** Un triangle blanc aux angles arrondis. */
export function LogoTriangle({ shape }: LogoTriangleProps) {
  return (
    <polygon
      className={styles.mark}
      points={shape === "small" ? LOGO_SMALL_TRIANGLE : LOGO_FULL_TRIANGLE}
      strokeWidth={LOGO_STROKE}
      strokeLinejoin="round"
    />
  );
}
