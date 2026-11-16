/**
 * Géométrie du logo PipeCut, dans sa boîte de vue. Partagée par le logo statique et le logo animé,
 * qui superpose les mêmes formes en calques séparés.
 */
export const LOGO_VIEW_BOX = "4 4 112 112";

/** Carré arrondi du fond. */
export const LOGO_SQUARE = { x: 4, y: 4, size: 112, radius: 27 } as const;

/** Grand triangle « lecture » : blanc et entier avant la coupe, rose et masqué après. */
export const LOGO_FULL_TRIANGLE = "47,38.299 83.169,60 47,81.701";

/** Petit triangle blanc : ce qui reste du triangle « lecture » une fois coupé. */
export const LOGO_SMALL_TRIANGLE = "47,38.299 70.569,52.44 47,66.581";

/** Épaisseur du contour arrondi des triangles. */
export const LOGO_STROKE = 6;

/** Épaisseur du contour du masque : laisse un espace entre le petit triangle et la partie coupée. */
export const LOGO_MASK_STROKE = 12;

/** Zone couverte par le masque de la partie coupée : tout le dessin. */
export const LOGO_MASK_BOX = { x: 0, y: 0, width: 120, height: 120 } as const;

/** Teintes d'un masque SVG : le blanc laisse voir ce qu'il recouvre, le noir le cache. */
export const MASK_SHOWN = "#fff";
export const MASK_HIDDEN = "#000";
