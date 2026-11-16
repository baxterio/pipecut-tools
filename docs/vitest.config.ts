/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

// getViteConfig applique la configuration d'Astro : les tests peuvent importer des fichiers .astro
export default getViteConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
    // les tests ignorent le contenu des feuilles de style, sauf celle des variables : src/lib/tokens.ts
    // y lit la couleur du fond de page
    css: { include: [/\/styles\/tokens\.css/] },
  },
});
