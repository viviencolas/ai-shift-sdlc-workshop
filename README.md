# AI Shift · Semaine AI SDLC

Supports de la semaine d'ateliers **AI SDLC** (7 au 11 décembre 2026) : cinq jours pour parcourir le cycle de développement avec des agents Cursor.

```
DISCOVER → SPECIFY → PROTOTYPE ∥ QUALITY → CODE
```

**Guide participant en ligne : <https://viviencolas.github.io/ai-shift-sdlc-workshop/>**

## Sommaire du dépôt

| Dossier | À quoi il sert |
|---------|----------------|
| [`guide-participant/`](guide-participant/README.md) | Le guide des cinq jours, publié en site web (GitHub Pages) |
| [`ateliers/`](ateliers/README.md) | Un dossier par atelier, numéroté : guide animateur, supports, solutions, package |
| &nbsp;&nbsp;[`ateliers/01-discover/`](ateliers/01-discover/README.md) | Lundi · Discover |
| &nbsp;&nbsp;[`ateliers/02-specify/`](ateliers/02-specify/README.md) | Mardi · Specify (supports, solutions de secours, package participant) |
| &nbsp;&nbsp;[`ateliers/03-prototype/`](ateliers/03-prototype/README.md) | Mercredi · Prototype (pack installable) |
| &nbsp;&nbsp;[`ateliers/04-quality/`](ateliers/04-quality/README.md) | Jeudi · Quality |
| &nbsp;&nbsp;[`ateliers/05-code/`](ateliers/05-code/README.md) | Vendredi · Code |
| [`kit-cursor/`](kit-cursor/README.md) | Le kit Cursor partagé par toute la semaine : modes, rules, configuration MCP, schémas, installateur |
| [`reference/`](reference/README.md) | Références transverses (catalogue des agents) |
| [`application-notion-like/`](application-notion-like/README.md) | Emplacement du code de l'application « notion like » (README seulement pour l'instant) |

Fichiers à la racine : [`CONTRIBUTING.md`](CONTRIBUTING.md) (où chaque animateur dépose son atelier), `index.html` (redirige vers le guide, pour GitHub Pages), `.nojekyll` et `.gitignore`.

## Les cinq ateliers

| Jour | Atelier | Animateur | Ce qui est produit | Dossier | Page du guide |
|------|---------|-----------|--------------------|---------|---------------|
| Lun. 7 déc. | Discover | Ilyasse EL KHAIRA | Une epic Jira, MCP Atlassian connecté | [`01-discover`](ateliers/01-discover/README.md) | [jour 1](guide-participant/jour-1-discover.html) |
| Mar. 8 déc. | Specify | Vivien COLAS | Des stories prêtes à prototyper (`prete` / `brouillon`) | [`02-specify`](ateliers/02-specify/README.md) | [jour 2](guide-participant/jour-2-specify.html) |
| Mer. 9 déc. | Prototype | Yassine AQEJJAJ | Prototype Figma cliquable (`figma.yaml`) | [`03-prototype`](ateliers/03-prototype/README.md) | [jour 3](guide-participant/jour-3-prototype.html) |
| Jeu. 10 déc. | Quality | Ismael TRAORE | Stories désambiguïsées, plan de test | [`04-quality`](ateliers/04-quality/README.md) | [jour 4](guide-participant/jour-4-quality.html) |
| Ven. 11 déc. | Code | Patrick BLOT | PR verte, estimation IA calibrée | [`05-code`](ateliers/05-code/README.md) | [jour 5](guide-participant/jour-5-code.html) |

> Les pages des jours 1, 3, 4 et 5 contiennent encore des encadrés « À compléter par l'animateur » : elles sont publiées telles quelles.

## Ouvrir le guide

- **En ligne** : <https://viviencolas.github.io/ai-shift-sdlc-workshop/>.
- **En local** : ouvrir [`guide-participant/index.html`](guide-participant/index.html) dans un navigateur, ou lancer `python3 -m http.server` à la racine puis aller sur `http://localhost:8000/`.

## Arborescence

```
.
├── README.md  CONTRIBUTING.md  index.html  .nojekyll  .gitignore
├── guide-participant/            guide des 5 jours (site)
│   ├── index.html  jour-1-discover.html … jour-5-code.html
│   └── captures/
├── ateliers/
│   ├── 01-discover/              guide-animateur.md
│   ├── 02-specify/               guide-animateur.md, guide-participant.html (redirection)
│   │   ├── supports/             2 présentations HTML
│   │   ├── solutions/            .cursor/ de secours + README
│   │   ├── package/              .cursor/ + README + specify-cursor-kit.zip
│   │   └── captures/
│   ├── 03-prototype/             guide-animateur.md, pack-prototype.zip
│   │   └── pack-prototype/       pack installable (.cursor/, skills/, pivots/, examples/, install.sh)
│   ├── 04-quality/               guide-animateur.md
│   └── 05-code/                  guide-animateur.md
├── kit-cursor/                   .cursor/ (17 modes, 18 rules, mcp.json), pivots/, examples/, install.sh
├── reference/                    catalogue-agents-plugins.md
└── application-notion-like/      README.md (pas de code)
```

## Conventions

- Les dossiers destinés à être copiés dans un projet s'appellent `.cursor/`.
- Les identifiants propres à une organisation sont remplacés par des espaces réservés (par exemple `VOTRE-SITE.atlassian.net`) : l'animateur communique la valeur réelle en séance.
- Dépôt public : aucun secret ni donnée interne (voir [CONTRIBUTING.md](CONTRIBUTING.md)).
