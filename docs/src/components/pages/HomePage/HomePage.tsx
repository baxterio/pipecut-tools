import type { ReactNode } from "react";
import { heroTitle, type Language, languageLinks, type Translate } from "../../../i18n";
import type { Timeline } from "../../../lib/sequence";
import { DOWNLOAD_ANCHOR, DOWNLOAD_URLS, VIDEO_ANCHOR } from "../../../lib/site";
import { Footer } from "../../organisms/Footer";
import { Header } from "../../organisms/Header";
import { Hero } from "../../organisms/Hero";

interface HomePageProps {
  /** Langue de la page. */
  language: Language;
  /** Les textes de cette langue. */
  t: Translate;
  /** Timeline de la séquence du haut de page, calculée au build. */
  timeline: Timeline;
  /**
   * Les boutons Partager et Télécharger du header, seules îles hydratées de la page. Le fichier de
   * route Astro les fournit par les emplacements nommés `share` et `download`, qu'Astro transmet comme
   * des propriétés : d'où les types optionnels, la vérification des types ne voyant pas les emplacements.
   */
  share?: ReactNode;
  download?: ReactNode;
}

/** La page d'accueil : le header, le haut de page et le pied de page. Le reste de la page viendra plus tard. */
export function HomePage({ language, t, timeline, share, download }: HomePageProps) {
  return (
    <>
      <Header homeLabel={t("header.home")} share={share} download={download} />
      <main>
        <Hero
          title={heroTitle(t)}
          tagline={[t("hero.tagline.promise"), t("hero.tagline.how")]}
          timeline={timeline}
          downloadId={DOWNLOAD_ANCHOR}
          downloads={[
            { label: t("hero.downloadMac"), href: DOWNLOAD_URLS.mac },
            { label: t("hero.downloadWindows"), href: DOWNLOAD_URLS.windows },
          ]}
          free={t("hero.free")}
          requirements={t("hero.requirements")}
          video={{ label: t("hero.watchVideo"), href: `#${VIDEO_ANCHOR}` }}
        />
      </main>
      <Footer languagesLabel={t("footer.languages")} languages={languageLinks()} current={language} />
    </>
  );
}
