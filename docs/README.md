# Site de PipeCut

Le site de présentation de PipeCut, publié sur [pipecut.app](https://pipecut.app). Pour l'instant : la page
d'accueil, avec son header, son haut de page animé et son pied de page, dans les huit langues de l'app.

Astro génère chaque page en HTML statique au build. Les composants sont en React et TypeScript, rendus au
build : seuls les boutons Partager et Télécharger du header, qui ouvrent chacun un menu, sont hydratés dans
le navigateur.

## Commandes

Depuis ce dossier, avec Node 24 et pnpm :

```bash
pnpm install
pnpm dev         # site en local, rechargé à chaque modification
pnpm build       # site statique dans dist/
pnpm preview     # sert dist/ en local
pnpm test        # tests Vitest
pnpm typecheck   # types, fichiers .astro compris
pnpm lint        # oxlint et formatage Biome (pnpm format pour corriger)
pnpm og          # régénère les images d'aperçu de lien (demande Chrome)
```

## Langues

Le site est traduit dans les langues de l'app, dans le même ordre : français, anglais (États-Unis et
Royaume-Uni), espagnol, allemand, italien, portugais (Brésil et Portugal). Chaque langue a sa page :
`/fr/`, `/en/`, `/en-gb/`, `/es/`, `/de/`, `/it/`, `/pt-br/`, `/pt-pt/`.

- Les textes sont dans `src/i18n/locales/<langue>.json`. `fr.json` fait référence : les clés sont typées
  dessus, et un test vérifie que les autres fichiers ont les mêmes clés, les mêmes variables
  (`{{version}}`) et les mêmes renvois (`$t(hero.free)`).
- La traduction passe par i18next, comme dans l'app. Elle ne tourne qu'au build : chaque page est écrite
  en HTML dans sa langue, et les deux menus hydratés reçoivent leurs textes déjà traduits. Le navigateur
  ne charge ni i18next ni les fichiers de langue.
- Aucun texte n'est écrit dans un composant : un composant reçoit ses textes en propriétés, et c'est le
  fichier de route ou `HomePage` qui les demande à `t("…")`.
- La racine du site (`/`) envoie chaque navigateur vers sa langue, d'après ses langues préférées, et
  vers l'anglais s'il n'en connaît aucune (`src/i18n/languages.ts`, mêmes règles que l'app). Sans
  JavaScript, elle propose de choisir la langue. Elle porte les balises d'aperçu de lien en français :
  c'est l'adresse que la page française partage. Elle ne redirige que par script, pour que les robots
  des réseaux sociaux lisent bien ses balises.
- Le pied de page propose toutes les langues, par de vrais liens.

## Organisation

- `src/components/` suit l'atomic design : `atoms`, `molecules`, `organisms`, `pages`. Un niveau n'importe
  jamais un niveau supérieur. Chaque composant a son dossier, avec ses styles (CSS Modules), son test et
  son `index.ts`.
- `src/pages/` est le dossier de routage d'Astro : ses fichiers chargent les textes, calculent la séquence
  et remplissent le `<head>`, sans interface. Les pages au sens atomique sont dans `src/components/pages/`.
- `src/i18n/` contient la liste des langues (`languages.ts`), l'instance i18next (`index.ts`) et les
  textes, un fichier JSON par langue (`locales/`).
- `src/lib/sequence.ts` calcule la timeline de l'animation du haut de page à partir des textes de la
  langue. Elle est posée en variables CSS dans le HTML : les animations sont en CSS, sans JavaScript.
- `src/lib/site.ts` réunit les adresses et les constantes du site, dont les liens de téléchargement.
- `src/styles/tokens.css` déclare une seule fois les couleurs, les ombres et les valeurs partagées (cible
  tactile, arrondi, durée des transitions). Les composants les lisent par `var(--…)`, et
  `src/lib/tokens.ts` les donne au HTML quand il en a besoin (couleur de la barre du navigateur). Seuls les
  points de rupture des `@media` restent écrits dans les feuilles : CSS n'y accepte pas de variable.
- Les deux menus du header partagent l'atome `Popover` : le panneau, son enveloppe (`PopoverAnchor`), ses
  rangées cliquables (`PopoverItem`) et son état (`usePopover`).

## Liens de téléchargement

Les boutons du haut de page et les choix du menu Télécharger mènent à la dernière release de l'app sur ce
dépôt, par `releases/latest/download/…` (`src/lib/site.ts`). Les fichiers y portent un nom sans numéro de version : `pipecut-arm64.dmg` pour Mac,
`pipecut-x64.exe` pour Windows. Les releases des outils (ffmpeg, whisper-cli) sont des préversions, que
`releases/latest` ignore.

Le menu Télécharger affiche le numéro de version de l'app quand la variable d'environnement
`PIPECUT_VERSION` est fournie au build : un numéro (`1.4.0`) ou le tag d'une release (`v1.4.0`). Sans elle, il
n'affiche que « Gratuit · Sans compte ». La forme de la mention (« · v1.4.0 ») est dans les fichiers de langue.

```bash
PIPECUT_VERSION=1.4.0 pnpm build
```

## Images d'aperçu de lien

`pnpm og` écrit une image par langue dans `public/og/`. Le script lance le serveur de développement, le
temps de photographier avec Chrome la carte d'aperçu de chaque langue (`src/pages/[lang]/og.astro`,
composant `SocialCard`). La carte est faite des composants du haut de page : l'image suit leur dessin. Elle
n'existe que sur le serveur de développement, le build ne la publie pas.

À relancer quand le titre, l'accroche ou le dessin du haut de page change.

## Ajouter une langue

Les langues du site suivent celles de l'app : en ajouter une là-bas, puis ici.

1. Ajouter son code à `LANGUAGES` et son nom à `LANGUAGE_NAMES` dans `src/i18n/languages.ts`, et dire à
   `matchLanguage` quelles langues de navigateur y mènent.
2. Créer `src/i18n/locales/<code>.json` sur le modèle de `fr.json`, et le déclarer dans `src/i18n/index.ts`.
   Le titre en trois mots s'adapte à la langue plutôt que de se traduire mot à mot.
3. Lancer `pnpm og`, qui génère l'image d'aperçu de chaque langue.
4. Vérifier, sur un téléphone de 320 px de large, que le mot le plus long du titre et les deux boutons de
   téléchargement tiennent dans la page, et que la marque et les deux boutons du header tiennent sur leur
   ligne.

## Publication

Le workflow `.github/workflows/site.yml` vérifie chaque pull request qui touche ce dossier, puis publie le
site sur GitHub Pages à chaque fusion dans `main`.
