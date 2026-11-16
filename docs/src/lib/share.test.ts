import { describe, expect, it } from "vitest";
import { translator } from "../i18n";
import { buildShareLinks } from "./share";
import { SITE_URL } from "./site";

// le texte de la spec, encodé à la main : accents, deux-points et virgules compris
const ENCODED_TEXT =
  "PipeCut%20%3A%20t%C3%A9l%C3%A9charge%2C%20d%C3%A9coupe%20et%20sous-titre%20tes%20vid%C3%A9os%20pour%20X%2C%20sur%20ton%20ordinateur.";
const ENCODED_URL = "https%3A%2F%2Fpipecut.app";

describe("buildShareLinks", () => {
  const text = translator("fr")("share.text");
  const links = buildShareLinks(text, SITE_URL);
  const href = (id: string) => links.find((link) => link.id === id)?.href;

  it("propose les six réseaux dans l'ordre de la spec", () => {
    expect(links.map((link) => link.name)).toEqual(["X", "Bluesky", "Facebook", "WhatsApp", "LinkedIn", "Telegram"]);
  });

  it("construit l'URL de chaque réseau", () => {
    expect(href("x")).toBe(`https://x.com/intent/post?text=${ENCODED_TEXT}&url=${ENCODED_URL}`);
    expect(href("bluesky")).toBe(`https://bsky.app/intent/compose?text=${ENCODED_TEXT}%20${ENCODED_URL}`);
    expect(href("facebook")).toBe(`https://www.facebook.com/sharer/sharer.php?u=${ENCODED_URL}`);
    expect(href("whatsapp")).toBe(`https://wa.me/?text=${ENCODED_TEXT}%20${ENCODED_URL}`);
    expect(href("linkedin")).toBe(`https://www.linkedin.com/sharing/share-offsite/?url=${ENCODED_URL}`);
    expect(href("telegram")).toBe(`https://t.me/share/url?url=${ENCODED_URL}&text=${ENCODED_TEXT}`);
  });

  it("encode les accents, les deux-points, les virgules et les esperluettes", () => {
    const [x] = buildShareLinks("Été : a, b & c ?", "https://example.com/a?b=1&c=2");
    expect(x?.href).toBe(
      "https://x.com/intent/post?text=%C3%89t%C3%A9%20%3A%20a%2C%20b%20%26%20c%20%3F&url=https%3A%2F%2Fexample.com%2Fa%3Fb%3D1%26c%3D2"
    );
  });

  it("produit des URL valides, dont le texte se relit à l'identique", () => {
    for (const link of links) {
      const url = new URL(link.href);
      expect(url.protocol).toBe("https:");
    }
    expect(new URL(href("x") ?? "").searchParams.get("text")).toBe(text);
    expect(new URL(href("whatsapp") ?? "").searchParams.get("text")).toBe(`${text} ${SITE_URL}`);
    expect(new URL(href("telegram") ?? "").searchParams.get("url")).toBe(SITE_URL);
    expect(new URL(href("telegram") ?? "").searchParams.get("text")).toBe(text);
  });
});
