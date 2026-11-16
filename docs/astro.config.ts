import react from "@astrojs/react";
import { defineConfig } from "astro/config";
import { LANGUAGES, languagePath, REFERENCE_LANGUAGE } from "./src/i18n/languages.ts";
import { SITE_URL } from "./src/lib/site.ts";

// Site statique : chaque page est générée en HTML au build (référencement, aperçus de lien).
export default defineConfig({
  site: SITE_URL,
  output: "static",
  trailingSlash: "always",
  integrations: [react()],
  i18n: {
    locales: LANGUAGES.map(languagePath),
    defaultLocale: languagePath(REFERENCE_LANGUAGE),
    routing: {
      // une URL par langue, y compris pour la langue de référence : /fr/, /en/, /en-gb/…
      prefixDefaultLocale: true,
      // la racine est une page à part entière (src/pages/index.astro) : elle porte les balises d'aperçu
      // de lien et choisit la langue du navigateur. Astro ne doit pas la remplacer par sa propre redirection.
      redirectToDefaultLocale: false,
    },
  },
});
