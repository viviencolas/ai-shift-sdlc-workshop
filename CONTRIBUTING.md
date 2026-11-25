# Contribuer

Ce dépôt rassemble les supports de la semaine AI SDLC. Chaque animateur dépose **son atelier dans son propre dossier**, sans toucher à celui des autres.

## Où déposer quoi

| Contenu | Emplacement |
|---------|-------------|
| Page de l'atelier dans le guide participant | `guide/jour-N-<nom>.html` (et la carte du jour dans `guide/index.html`) |
| Supports de présentation, solutions de secours, package participant | `atelier-N-<nom>/` avec `support/`, `solutions/`, `package/` (modèle : `atelier-2-specify/`) |
| Agents, rules, modes, skills partagés par toute la semaine | `kit/` |
| Guide animateur d'un atelier | `kit/ateliers/<nom>/facilitator-guide.md` |
| Pack installable propre à un atelier | `kit/atelier-N-<nom>/` (+ son `.zip`) |
| Documents transverses (catalogue, cadrage) | `docs/` |
| Captures d'écran et médias | `media/<atelier>/` |
| Code de l'application « notion like » | `app/` (voir `app/README.md`) |

Dossiers d'ateliers attendus : `atelier-1-discover/`, `atelier-2-specify/`, `atelier-3-prototype/`, `atelier-4-quality/`, `atelier-5-code/`.

## Règles

1. **Un dossier = un animateur.** Ouvrez une branche `atelier-N-<sujet>` et une pull request ; ne modifiez les autres ateliers qu'avec l'accord de leur animateur.
2. **Dossiers `.cursor/`** : tout ce qui est destiné à être copié dans un projet s'appelle `.cursor/` (jamais `dotcursor/`).
3. **Liens relatifs uniquement**, pour que le guide fonctionne en local et sur GitHub Pages.
4. **Dépôt public : aucun secret, aucune donnée interne.** Pas de jeton, clé d'API, e-mail, identifiant de compte, URL privée Jira/Figma/Slack, ni notes internes. Utilisez des espaces réservés (`VOTRE-SITE.atlassian.net`, `<votre-jeton>`).
5. Les zones à compléter dans le guide sont signalées par un encadré « À compléter par l'animateur » : remplacez-le par votre contenu.
6. Si vous modifiez un dossier `.cursor/` livré aussi en `.zip`, régénérez le `.zip`.

## Prévisualiser le guide

Ouvrez `guide/index.html` dans un navigateur, ou lancez `python3 -m http.server` à la racine puis allez sur `http://localhost:8000/`.
