# Contribuer

Ce dépôt rassemble les supports de la semaine AI SDLC. Chaque animateur dépose **son atelier dans son propre dossier**, sans toucher à celui des autres.

## Où déposer quoi

| Contenu | Emplacement |
|---------|-------------|
| Page de l'atelier dans le guide participant | `guide-participant/jour-N-<nom>.html` (et la carte du jour dans `guide-participant/index.html`) |
| Guide animateur d'un atelier | `ateliers/0N-<nom>/guide-animateur.md` |
| Supports de présentation | `ateliers/0N-<nom>/supports/` |
| Solutions de secours | `ateliers/0N-<nom>/solutions/` |
| Package ou pack installable pour les participants | `ateliers/0N-<nom>/package/` (modèle : `ateliers/02-specify/`) |
| Captures d'écran | `ateliers/0N-<nom>/captures/` ou `guide-participant/captures/` |
| Agents, rules, modes, skills partagés par toute la semaine | `kit-cursor/` |
| Documents transverses (catalogue, cadrage) | `reference/` |
| Code de l'application « notion like » | `application-notion-like/` (voir son README) |

Chaque dossier d'atelier a un `README.md` qui liste son contenu : mettez-le à jour quand vous ajoutez un fichier, ainsi que le sommaire du README racine si vous créez un dossier.

## Règles

1. **Un dossier d'atelier = un animateur.** Ouvrez une branche `atelier-0N-<sujet>` et une pull request ; ne modifiez les autres ateliers qu'avec l'accord de leur animateur.
2. **Dossiers `.cursor/`** : tout ce qui est destiné à être copié dans un projet s'appelle `.cursor/` (jamais `dotcursor/`).
3. **Liens relatifs**, pour que le guide fonctionne en local et sur GitHub Pages. Seule exception : les liens du guide vers des fichiers `.md`, qui pointent vers GitHub (GitHub Pages n'affiche pas le Markdown).
4. **Dépôt public : aucun secret, aucune donnée interne.** Pas de jeton, clé d'API, e-mail, identifiant de compte, URL privée Jira/Figma/Slack, ni notes internes. Utilisez des espaces réservés (`VOTRE-SITE.atlassian.net`, `<votre-jeton>`).
5. Les zones à compléter dans le guide sont signalées par un encadré « À compléter par l'animateur » : remplacez-le par votre contenu.
6. Si vous modifiez un dossier `.cursor/` livré aussi en `.zip`, régénérez le `.zip`.

## Prévisualiser le guide

Ouvrez `guide-participant/index.html` dans un navigateur, ou lancez `python3 -m http.server` à la racine puis allez sur `http://localhost:8000/`.
