import sheet from "../styles/tokens.css?raw";

// les commentaires de la feuille peuvent citer une variable : seules les déclarations comptent
const declarations = sheet.replace(/\/\*[\s\S]*?\*\//g, "");

/**
 * Valeur d'une variable de tokens.css, pour les rares endroits où le HTML en a besoin (la couleur de
 * la barre du navigateur) : elle n'est écrite que dans la feuille de style.
 *
 * Le HTML ne sait pas résoudre une variable : celle-ci doit être déclarée une seule fois, avec une
 * valeur qui ne renvoie pas à une autre.
 */
export function token(name: `--${string}`): string {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const found = [...declarations.matchAll(new RegExp(`(?<![\\w-])${escaped}\\s*:\\s*([^;}]+)`, "g"))];
  const value = found[0]?.[1]?.trim();
  if (!value) {
    throw new Error(`tokens.css ne définit pas ${name}`);
  }
  if (found.length > 1) {
    throw new Error(`tokens.css définit ${name} plusieurs fois : laquelle donner au HTML ?`);
  }
  if (value.includes("var(")) {
    throw new Error(`${name} renvoie à une autre variable, que le HTML ne sait pas lire`);
  }
  return value;
}
