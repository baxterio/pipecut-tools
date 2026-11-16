// @vitest-environment node
//
// Rendu des fichiers de route avec le Container API d'Astro : c'est le HTML que le build écrit.
// Le test vit ici et non dans src/pages/, où un fichier .ts serait pris pour une route.
import reactRenderer from "@astrojs/react/server.js";
import { experimental_AstroContainer as AstroContainer } from "astro/container";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import { heroTitle, LANGUAGES, languagePath, translator } from "../i18n";
import { DOWNLOAD_URLS, languageUrl, ogImageUrl } from "../lib/site";
import { token } from "../lib/tokens";
import HomeRoute from "../pages/[lang]/index.astro";
import CardRoute from "../pages/[lang]/og.astro";
import RootRoute from "../pages/index.astro";

let container: AstroContainer;

beforeAll(async () => {
  container = await AstroContainer.create();
  container.addServerRenderer({ name: "@astrojs/react", renderer: reactRenderer });
  container.addClientRenderer({ name: "@astrojs/react", entrypoint: "@astrojs/react/client.js" });
});

type Route = Parameters<AstroContainer["renderToString"]>[0];

/** Rend une route à paramètre de langue, à l'adresse `/<segment>/<suite>`. */
function renderLanguageRoute(route: unknown, path: string, rest = "") {
  // une route à paramètres n'a pas de propriétés : son type de composant est à élargir
  return container.renderToString(route as Route, {
    params: { lang: path },
    request: new Request(`https://pipecut.app/${path}/${rest}`),
  });
}

const renderHome = (path: string) => renderLanguageRoute(HomeRoute, path);

/** Le contenu d'une balise, première occurrence. */
function element(html: string, tag: string): string {
  const match = html.match(new RegExp(`<${tag}[\\s>][\\s\\S]*?</${tag}>`));
  if (!match) {
    throw new Error(`pas de balise <${tag}> dans la page`);
  }
  return match[0];
}

/** Les îles hydratées de la page, dans l'ordre. */
function islands(html: string): string[] {
  return html.match(/<astro-island[\s\S]*?<\/astro-island>/g) ?? [];
}

/** L'île du bouton Télécharger du header : son HTML et les propriétés que le navigateur recevra. */
function downloadIsland(html: string): string {
  const island = islands(html).find((candidate) => candidate.includes("DownloadMenuButton"));
  if (!island) {
    throw new Error("pas d'île DownloadMenuButton dans la page");
  }
  return island.replaceAll("&quot;", '"');
}

describe("page d'accueil française", () => {
  const t = translator("fr");
  let html: string;
  beforeAll(async () => {
    html = await renderHome("fr");
  });

  it("contient le titre, l'accroche et les boutons en HTML", () => {
    const main = element(html, "main");

    expect(main).toContain('aria-label="Télécharge. Découpe. Sous-titre."');
    expect(main).toContain("Télécharge.");
    expect(main).toContain("Le bon extrait, au bon format, prêt à poster.");
    expect(main).toContain("Colle un lien, PipeCut s&#x27;occupe du reste.");
    expect(main).toContain(`href="${DOWNLOAD_URLS.mac}"`);
    expect(main).toContain(`href="${DOWNLOAD_URLS.windows}"`);
    expect(main).toContain("Télécharger pour Mac");
    expect(main).toContain("Télécharger pour Windows");
    expect(main).toContain('id="telecharger"');
    expect(main).toContain("Voir PipeCut en une minute");
  });

  it("rend le haut de page sans JavaScript", () => {
    const main = element(html, "main");

    expect(main).not.toContain("<script");
    expect(main).not.toContain("<astro-island");
  });

  it("n'hydrate que deux îles dans toute la page : les boutons Partager et Télécharger du header", () => {
    const found = islands(html);
    const header = element(html, "header");

    expect(found).toHaveLength(2);
    expect(found[0]).toContain('client="idle"');
    expect(found[0]).toContain("Partager");
    expect(found[1]).toContain('client="idle"');
    expect(found[1]).toContain("Télécharger");
    for (const island of found) {
      expect(header).toContain(island);
    }
  });

  it("rend les deux boutons du header fermés : aucun menu n'est dans le HTML", () => {
    const header = element(html, "header");

    expect(header.match(/aria-expanded="false"/g)).toHaveLength(2);
    expect(header).not.toContain('role="dialog"');
  });

  it("donne au menu Télécharger les liens vers les deux fichiers", () => {
    const island = downloadIsland(html);

    expect(island).toContain(DOWNLOAD_URLS.mac);
    expect(island).toContain(DOWNLOAD_URLS.windows);
    expect(island).toContain("Pour Mac");
    expect(island).toContain("Pour Windows");
  });

  it("ne transmet au menu Partager que le texte et l'adresse : il construit lui-même les liens des réseaux", () => {
    const island = islands(html)[0] ?? "";

    expect(island.split(t("share.text"))).toHaveLength(2);
    expect(island).not.toContain("x.com/intent");
  });

  it("pose la timeline de la séquence en variables CSS, calculée au build", () => {
    const section = html.match(/<section[^>]*>/)?.[0] ?? "";

    expect(section).toContain("--seq-fill-at:0.6s");
    expect(section).toContain("--seq-cut-at:1.9s");
    expect(section).toContain("--seq-type-at:2.35s");
  });

  it("remplit le <head> pour le référencement et les aperçus de lien", () => {
    const head = element(html, "head");

    expect(html).toContain('<html lang="fr">');
    expect(head).toContain(`<title>${t("meta.title")}</title>`);
    expect(head).toContain('<meta name="description"');
    expect(head).toContain('<link rel="canonical" href="https://pipecut.app/fr/">');
    expect(head).toContain('<link rel="icon" href="/favicon.svg" type="image/svg+xml">');
    expect(head).toContain(`<meta property="og:title" content="${t("meta.ogTitle")}">`);
    expect(head).toContain('<meta property="og:url" content="https://pipecut.app/fr/">');
    expect(head).toContain('<meta property="og:image" content="https://pipecut.app/og/fr.png">');
    expect(head).toContain('<meta name="twitter:card" content="summary_large_image">');
  });

  it("annonce la page de chaque langue aux moteurs de recherche, et la racine pour les autres langues", () => {
    const head = element(html, "head");

    for (const language of LANGUAGES) {
      expect(head).toContain(`<link rel="alternate" hreflang="${language}" href="${languageUrl(language)}">`);
    }
    expect(head).toContain('<link rel="alternate" hreflang="en-GB" href="https://pipecut.app/en-gb/">');
    expect(head).toContain('<link rel="alternate" hreflang="x-default" href="https://pipecut.app/">');
  });

  it("donne à la barre du navigateur la couleur du fond de page, lue dans la feuille des variables", () => {
    expect(element(html, "head")).toContain(`<meta name="theme-color" content="${token("--color-bg")}">`);
    expect(token("--color-bg")).toMatch(/^#[0-9a-f]{6}$/);
  });

  it("ne publie aucun code pays : og:locale, qui en exige un, est omis", () => {
    const head = element(html, "head");

    expect(head).not.toContain("og:locale");
    expect(head).not.toMatch(/content="[a-z]{2}[_-][A-Z]{2}"/);
  });

  it("reprend l'accroche dans l'aperçu affiché par les réseaux", () => {
    expect(element(html, "head")).toContain(
      '<meta property="og:description" content="Le bon extrait, au bon format, prêt à poster.">'
    );
  });

  it("partage l'adresse de la racine du site, qui porte l'aperçu en français", () => {
    const island = (islands(html)[0] ?? "").replaceAll("&quot;", '"');

    expect(island).toContain('"url":[0,"https://pipecut.app"]');
  });

  it("propose les autres langues dans le pied de page, par de vrais liens", () => {
    const footer = element(html, "footer");

    for (const language of LANGUAGES) {
      expect(footer).toContain(`href="/${languagePath(language)}/"`);
    }
    expect(footer).toContain("English (UK)");
    expect(footer).not.toContain("<astro-island");
    expect(footer.match(/aria-current="page"/g)).toHaveLength(1);
  });
});

describe("numéro de version de l'app", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("n'est pas affiché tant qu'il n'est pas fourni au build", async () => {
    vi.stubEnv("PIPECUT_VERSION", "");

    expect(downloadIsland(await renderHome("fr"))).toContain('"mentions":[0,"Gratuit · Sans compte"]');
  });

  it("suit les mentions du menu Télécharger quand la variable PIPECUT_VERSION est fournie au build", async () => {
    vi.stubEnv("PIPECUT_VERSION", "pipecut-1.4.0");

    expect(downloadIsland(await renderHome("fr"))).toContain('"mentions":[0,"Gratuit · Sans compte · v1.4.0"]');
    expect(downloadIsland(await renderHome("en"))).toContain('"mentions":[0,"Free · No account · v1.4.0"]');
  });
});

describe("page d'accueil de chaque langue", () => {
  it.each(LANGUAGES)("« %s » est rendue dans sa langue, avec son propre <head>", async (language) => {
    const t = translator(language);
    const title = heroTitle(t);
    const html = await renderHome(languagePath(language));
    const head = element(html, "head");

    expect(html).toContain(`<html lang="${language}">`);
    expect(head).toContain(`<title>${t("meta.title")}</title>`);
    expect(head).toContain(`<link rel="canonical" href="${languageUrl(language)}">`);
    expect(head).toContain(`<meta property="og:image" content="${ogImageUrl(language)}">`);
    expect(element(html, "main")).toContain(`aria-label="${title.download} ${title.cut} ${title.subtitle}"`);
  });

  it("partage l'adresse de la page anglaise, pour un aperçu de lien en anglais", async () => {
    const island = (islands(await renderHome("en"))[0] ?? "").replaceAll("&quot;", '"');

    expect(island).toContain('"url":[0,"https://pipecut.app/en/"]');
  });

  it("n'a pas de page pour une adresse qui n'est pas une langue du site", async () => {
    await expect(renderHome("nl")).rejects.toThrow("Langue inconnue : nl");
  });
});

describe("racine du site", () => {
  let html: string;
  beforeAll(async () => {
    html = await container.renderToString(RootRoute, { request: new Request("https://pipecut.app/") });
  });

  it("choisit la langue du navigateur par un script, qui suit les règles de src/i18n/languages", () => {
    expect(element(html, "body")).toMatch(/<script type="module"[^>]*>/);
  });

  it("ne redirige par aucune balise : les robots des réseaux, qui en suivent, liraient l'aperçu d'une autre page", () => {
    expect(html).not.toContain('http-equiv="refresh"');
  });

  it("propose le choix de la langue, par de vrais liens, au navigateur qui n'exécute pas de script", () => {
    const fallback = element(element(html, "body"), "noscript");

    for (const language of LANGUAGES) {
      expect(fallback).toContain(`href="/${languagePath(language)}/"`);
    }
    expect(fallback).not.toContain("aria-current");
    expect(fallback).toContain("<main");
  });

  it("n'affiche rien d'autre : la page reste vide le temps de la redirection", () => {
    const body = element(html, "body").replace(/<noscript>[\s\S]*?<\/noscript>/, "");

    expect(body).not.toContain("<main");
    expect(body).not.toContain("<nav");
  });

  it("garde les balises d'aperçu de lien : c'est l'adresse que le menu Partager diffuse", () => {
    const t = translator("fr");
    const head = element(html, "head");

    expect(html).toContain('<html lang="fr">');
    expect(head).toContain(`<meta property="og:title" content="${t("meta.ogTitle")}">`);
    expect(head).toContain('<meta property="og:image" content="https://pipecut.app/og/fr.png">');
    expect(head).toContain('<meta name="twitter:card" content="summary_large_image">');
  });

  it("est sa propre adresse canonique : celle que les autres pages annoncent pour les langues absentes du site", () => {
    const head = element(html, "head");

    expect(head).toContain('<link rel="canonical" href="https://pipecut.app/">');
    expect(head).toContain('<meta property="og:url" content="https://pipecut.app/">');
    expect(head).toContain('<link rel="alternate" hreflang="x-default" href="https://pipecut.app/">');
  });
});

describe("carte d'aperçu de lien", () => {
  it("montre le titre et l'accroche de la langue, sans header ni pied de page", async () => {
    const html = await renderLanguageRoute(CardRoute, "de", "og/");

    expect(html).toContain('<html lang="de">');
    expect(element(html, "main")).toContain('aria-label="Laden. Schneiden. Untertiteln."');
    expect(element(html, "main")).toContain("Der richtige Clip, im richtigen Format, bereit zum Posten.");
    expect(html).not.toContain("<header");
    expect(html).not.toContain("<footer");
    expect(html).not.toContain("<astro-island");
  });
});
