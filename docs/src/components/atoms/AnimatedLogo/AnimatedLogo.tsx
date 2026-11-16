import { LOGO_VIEW_BOX } from "../../../lib/logo";
import { LogoBackground, LogoCutPart, LogoTriangle } from "../Logo";
import styles from "./AnimatedLogo.module.css";

const GRADIENT_ID = "animated-logo-gradient";
const MASK_ID = "animated-logo-mask";

/**
 * Logo du haut de page : les formes du logo en quatre calques superposés de même taille, pilotés par
 * la séquence. Le fond, la partie coupée, le petit triangle, et le grand triangle entier affiché avant
 * la coupe. Chaque calque est un SVG à part : animer l'intérieur d'un seul SVG désynchronisait la maquette.
 */
export function AnimatedLogo() {
  return (
    <span className={styles.logo} aria-hidden="true" data-animated-logo>
      <svg className={styles.layer} viewBox={LOGO_VIEW_BOX} focusable="false" data-layer="background">
        <LogoBackground gradientId={GRADIENT_ID} />
      </svg>
      <svg className={`${styles.layer} ${styles.cutPart}`} viewBox={LOGO_VIEW_BOX} focusable="false" data-layer="cut">
        <LogoCutPart maskId={MASK_ID} />
      </svg>
      <svg className={`${styles.layer} ${styles.mark}`} viewBox={LOGO_VIEW_BOX} focusable="false" data-layer="mark">
        <LogoTriangle shape="small" />
      </svg>
      <svg className={`${styles.layer} ${styles.whole}`} viewBox={LOGO_VIEW_BOX} focusable="false" data-layer="whole">
        <LogoTriangle shape="full" />
      </svg>
    </span>
  );
}
