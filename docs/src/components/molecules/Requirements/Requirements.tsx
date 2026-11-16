import styles from "./Requirements.module.css";

interface RequirementsProps {
  /** « Gratuit · Sans compte » */
  free: string;
  /** Configuration requise. */
  requirements: string;
}

/** Les mentions sous les boutons de téléchargement. */
export function Requirements({ free, requirements }: RequirementsProps) {
  return (
    <div className={styles.mentions}>
      <p className={styles.free}>{free}</p>
      <p className={styles.requirements}>{requirements}</p>
    </div>
  );
}
