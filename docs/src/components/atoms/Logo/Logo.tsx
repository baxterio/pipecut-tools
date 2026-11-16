import { LOGO_VIEW_BOX } from "../../../lib/logo";
import styles from "./Logo.module.css";
import { LogoBackground, LogoCutPart, LogoTriangle } from "./LogoShapes";

interface LogoProps {
  /** Côté du logo, en pixels. */
  size?: number;
  /** Préfixe des identifiants SVG (dégradé, masque) : unique par logo présent dans la page. */
  idPrefix?: string;
  className?: string;
}

/** Logo statique, dans sa forme finale (triangle coupé). Décoratif : le nom « PipeCut » l'accompagne. */
export function Logo({ size = 26, idPrefix = "logo", className }: LogoProps) {
  return (
    <svg
      className={[styles.logo, className].filter(Boolean).join(" ")}
      viewBox={LOGO_VIEW_BOX}
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <LogoBackground gradientId={`${idPrefix}-gradient`} />
      <LogoCutPart maskId={`${idPrefix}-mask`} />
      <LogoTriangle shape="small" />
    </svg>
  );
}
