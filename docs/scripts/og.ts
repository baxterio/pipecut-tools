// Génère les images d'aperçu de lien, une par langue, dans public/og/.
// À relancer quand le titre, l'accroche ou le dessin du haut de page change : pnpm og
//
// Le script lance le serveur de développement du site, le temps de photographier la carte d'aperçu de
// chaque langue (src/pages/[lang]/og.astro) avec Chrome sans fenêtre. La carte est faite des composants
// du haut de page : l'image ne peut pas s'écarter de la page. Chemin de Chrome : variable CHROME_PATH,
// sinon l'emplacement habituel sur Mac.
import { execFile } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { dev } from "astro";
import { LANGUAGES } from "../src/i18n/languages.ts";
import { OG_IMAGE, ogCardHref, ogImagePath } from "../src/lib/site.ts";

// Chrome est attendu sans bloquer le script : le serveur, qui tourne dans ce même processus, doit lui répondre
const run = promisify(execFile);
/** Temps laissé à Chrome pour une image, en millisecondes : au-delà, il est arrêté et le script échoue. */
const CHROME_TIMEOUT = 60_000;

const root = path.resolve(import.meta.dirname, "..");
const chrome = process.env.CHROME_PATH ?? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
// un profil à part : sans lui, Chrome confierait la page à une fenêtre déjà ouverte, sans rien photographier
const profile = mkdtempSync(path.join(tmpdir(), "pipecut-og-"));

// sans la barre d'outils d'Astro, qui s'afficherait sur la photo
const server = await dev({ root, logLevel: "error", devToolbar: { enabled: false }, server: { host: "127.0.0.1" } });
const origin = `http://127.0.0.1:${server.address.port}`;

try {
  for (const language of LANGUAGES) {
    const image = path.join(root, "public", ogImagePath(language));
    mkdirSync(path.dirname(image), { recursive: true });
    // l'ancienne image est retirée d'abord : si Chrome n'écrit rien, le script le voit
    rmSync(image, { force: true });
    await run(
      chrome,
      [
        "--headless",
        "--hide-scrollbars",
        "--force-device-scale-factor=1",
        // la carte montre l'état final du haut de page : aucune animation
        "--force-prefers-reduced-motion",
        `--user-data-dir=${profile}`,
        `--window-size=${OG_IMAGE.width},${OG_IMAGE.height}`,
        "--virtual-time-budget=5000",
        `--screenshot=${image}`,
        origin + ogCardHref(language),
      ],
      { timeout: CHROME_TIMEOUT }
    );
    if (!existsSync(image)) {
      throw new Error(`Chrome n'a pas écrit ${path.relative(root, image)}`);
    }
    console.log(path.relative(root, image));
  }
} finally {
  await server.stop();
  rmSync(profile, { recursive: true, force: true });
}
