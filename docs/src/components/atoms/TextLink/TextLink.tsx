import type { AnchorHTMLAttributes, ReactNode } from "react";
import styles from "./TextLink.module.css";

interface TextLinkProps extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href"> {
  href: string;
  /** Icône placée avant le texte. */
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Lien corail, avec une icône optionnelle. */
export function TextLink({ icon, children, className, ...rest }: TextLinkProps) {
  return (
    <a {...rest} className={[styles.link, className].filter(Boolean).join(" ")}>
      {icon}
      <span>{children}</span>
    </a>
  );
}
