/** Réseaux proposés dans le panneau Partager, dans l'ordre d'affichage. */
export type ShareNetworkId = "x" | "bluesky" | "facebook" | "whatsapp" | "linkedin" | "telegram";

export interface ShareLink {
  id: ShareNetworkId;
  /** Nom du réseau : une marque, jamais traduite. */
  name: string;
  href: string;
}

/**
 * Construit le lien de partage de chaque réseau.
 * @param text message prérempli, dans la langue de la page
 * @param url adresse partagée
 */
export function buildShareLinks(text: string, url: string): ShareLink[] {
  const encodedText = encodeURIComponent(text);
  const encodedUrl = encodeURIComponent(url);
  // Bluesky et WhatsApp n'ont qu'un champ : le lien suit le texte, séparé par une espace
  const encodedTextAndUrl = encodeURIComponent(`${text} ${url}`);

  return [
    { id: "x", name: "X", href: `https://x.com/intent/post?text=${encodedText}&url=${encodedUrl}` },
    { id: "bluesky", name: "Bluesky", href: `https://bsky.app/intent/compose?text=${encodedTextAndUrl}` },
    { id: "facebook", name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { id: "whatsapp", name: "WhatsApp", href: `https://wa.me/?text=${encodedTextAndUrl}` },
    {
      id: "linkedin",
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    { id: "telegram", name: "Telegram", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}` },
  ];
}
