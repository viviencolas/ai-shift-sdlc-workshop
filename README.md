# AI Shift · Semaine AI SDLC

Supports de la semaine d'ateliers **AI SDLC** (7 au 11 décembre 2026) : cinq jours pour parcourir le cycle de développement avec des agents Cursor.

```
DISCOVER → SPECIFY → PROTOTYPE ∥ QUALITY → CODE
```

| Jour | Atelier | Animateur | Ce qui est produit |
|------|---------|-----------|--------------------|
| 1 · lun. 7 déc. | Discover | Ilyasse EL KHAIRA | Une epic Jira, MCP Atlassian connecté |
| 2 · mar. 8 déc. | Specify | Vivien COLAS | Des stories prêtes à prototyper (`prete` / `brouillon`) |
| 3 · mer. 9 déc. | Prototype | Yassine AQEJJAJ | Prototype Figma cliquable (`figma.yaml`) |
| 4 · jeu. 10 déc. | Quality | Ismael TRAORE | Stories désambiguïsées, plan de test |
| 5 · ven. 11 déc. | Code | Patrick BLOT | PR verte, estimation IA calibrée |

> Les pages des jours 1, 4 et 5 contiennent encore des encadrés « À compléter par l'animateur » : elles sont publiées telles quelles.

## Ouvrir le guide participant

- **En local** : ouvrir [`guide/index.html`](guide/index.html) dans un navigateur (ou `python3 -m http.server` à la racine, puis `http://localhost:8000/`).
- **GitHub Pages** : le dépôt est prêt (un `index.html` racine redirige vers le guide, `.nojekyll` est présent). Pour l'activer : *Settings → Pages → Deploy from a branch → `main` / `(root)`*. Le guide sera alors à `https://viviencolas.github.io/ai-shift-sdlc-workshop/`.

## Arborescence

```
.
├── README.md                     ← vous êtes ici
├── CONTRIBUTING.md               ← où chaque animateur dépose son atelier
├── index.html                    ← redirection vers le guide (GitHub Pages)
├── guide/                        ← guide participant des 5 jours
│   ├── index.html
│   └── jour-1-discover.html … jour-5-code.html
├── atelier-2-specify/            ← atelier du jour 2
│   ├── guide-participant.html    ← redirection vers guide/jour-2-specify.html
│   ├── support/                  ← supports de présentation (2 parties)
│   ├── solutions/                ← solutions de secours (.cursor/ + README)
│   └── package/                  ← kit participant (.cursor/, README, specify-cursor-kit.zip)
├── kit/                          ← kit Cursor AI SDLC partagé
│   ├── .cursor/                  ← 17 modes, 18 rules, mcp.json
│   ├── pivots/  examples/        ← schémas et exemples YAML
│   ├── ateliers/                 ← guides animateur (discover, specify, prototype, quality, code)
│   ├── atelier-3-prototype/      ← pack installable Prototype (+ .zip)
│   └── install.sh
├── docs/
│   └── catalogue-agents-plugins.md
├── media/                        ← captures d'écran (guide, atelier 2)
└── app/                          ← emplacement du code de l'application « notion like »
    └── README.md
```

## Ateliers

| Atelier | Contenu dans le dépôt |
|---------|-----------------------|
| 1 · Discover | [page du guide](guide/jour-1-discover.html) · [guide animateur](kit/ateliers/discover/facilitator-guide.md) |
| 2 · Specify | [page du guide](guide/jour-2-specify.html) · [supports](atelier-2-specify/support/) · [solutions](atelier-2-specify/solutions/README.md) · [package participant](atelier-2-specify/package/README.md) · [guide animateur](kit/ateliers/specify/facilitator-guide.md) |
| 3 · Prototype | [page du guide](guide/jour-3-prototype.html) · [pack Prototype](kit/atelier-3-prototype/README.md) · [guide animateur](kit/ateliers/prototype/facilitator-guide.md) |
| 4 · Quality | [page du guide](guide/jour-4-quality.html) · [guide animateur](kit/ateliers/quality/facilitator-guide.md) |
| 5 · Code | [page du guide](guide/jour-5-code.html) · [guide animateur](kit/ateliers/code/facilitator-guide.md) |

Ressources transverses : [kit Cursor AI SDLC](kit/README.md) · [catalogue des agents](docs/catalogue-agents-plugins.md).

## Application « notion like »

Le code de l'application développée pendant la semaine ira dans [`app/`](app/README.md), qui explique ce qui doit y être déposé, comment la lancer et où trouver le suivi. Le dossier ne contient aucun code pour l'instant.

## Conventions

- Les dossiers destinés à être copiés dans un projet s'appellent `.cursor/`.
- Les identifiants propres à une organisation sont remplacés par des espaces réservés (par exemple `VOTRE-SITE.atlassian.net`) : l'animateur communique la valeur réelle en séance.
- Dépôt public : aucun secret ni donnée interne (voir [CONTRIBUTING.md](CONTRIBUTING.md)).
