import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from "react";
import styles from "./Button.module.css";

interface CommonProps {
  /** `accent` : bouton plein. `ghost` : contour seul. */
  variant?: "accent" | "ghost";
  /** `sm` : 36 px, dans le header (44 px sur écran tactile ou étroit). `lg` : 54 px, dans le haut de page. */
  size?: "sm" | "lg";
  children: ReactNode;
  className?: string;
}

type LinkProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "className" | "children" | "href"> & {
    href: string;
    ref?: Ref<HTMLAnchorElement>;
  };

type ActionProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "className" | "children"> & {
    href?: undefined;
    ref?: Ref<HTMLButtonElement>;
  };

export type ButtonProps = LinkProps | ActionProps;

/** Pilule. Avec `href`, c'est un vrai lien ; sans, un bouton d'action. */
export function Button({ variant = "accent", size = "sm", className, children, ...rest }: ButtonProps) {
  const classes = [styles.button, styles[variant], styles[size], className].filter(Boolean).join(" ");

  if (typeof rest.href === "string") {
    return (
      <a {...rest} className={classes}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" {...rest} className={classes}>
      {children}
    </button>
  );
}
