# Application « notion like »

Petite application de type Notion : des **pages** faites de blocs simples (titre, texte, liste à puces), avec création, édition, suppression et navigation entre pages. C'est la base sur laquelle les participants ajoutent des fonctionnalités pendant les ateliers.

**Stack** : Node 20+ (testé en 22), TypeScript, serveur `node:http` sans framework, front TypeScript sans framework, données dans un fichier JSON local (serveur) ou dans le navigateur (version statique). Aucune base externe, aucune clé, aucune donnée personnelle.

## Lancer, tester, héberger

```bash
cd application-notion-like
npm install
npm run dev        # compile puis démarre sur http://localhost:3000
npm test           # tests unitaires et API (node:test)
npm run typecheck  # vérification des types, serveur et front
```

Variables optionnelles (voir `.env.example`) : `PORT` (3000), `DATA_FILE` (`data/db.json`). Le fichier de données est créé au premier démarrage avec une page d'exemple ; supprimez `data/` pour repartir de zéro.

### Version statique (démo en ligne)

```bash
npm run start:static   # construit dist-static/ puis sert http://localhost:4000/application/
```

Même interface, sans serveur : les pages sont enregistrées dans le `localStorage` du navigateur, avec les mêmes règles que le serveur (`src/shared/pages.ts`). Le serveur Node reste utilisé pour le développement local.

**Limite : chaque navigateur a ses propres pages.** La démo ne partage aucune donnée entre personnes ni entre appareils, et vider les données du site efface les pages.

### Hébergement : GitHub Pages

Le workflow `.github/workflows/pages.yml` (à la racine du dépôt) teste et construit la version statique, puis, à chaque push sur `main`, publie un site combiné : le guide à la racine et l'application dans `/application/`. URL attendue : `https://viviencolas.github.io/ai-shift-sdlc-workshop/application/`.

Activation, une seule fois, par un administrateur du dépôt : **Settings > Pages > Build and deployment > Source : GitHub Actions**. Sur une pull request, le workflow teste et construit sans déployer.

Le serveur Node peut aussi être hébergé tel quel (par exemple Render, voir `render.yaml`), avec des données éphémères sur l'offre gratuite.

## Architecture

```
src/
  shared/             Code commun au serveur et au navigateur (aucune API Node)
    types.d.ts        Modèle de données (Page, Block, Database…)
    pages.ts          Modèle de page : règles et validation (création, édition, suppression)
    errors.ts         HttpError (code HTTP + message en français)
  server/
    index.ts          Point d'entrée : lit PORT et DATA_FILE, démarre le serveur
    app.ts            Serveur HTTP : routes /api/*, fichiers statiques de public/
    storage.ts        Stockage : charge et écrit data/db.json (écriture atomique)
  client/
    app.ts            Écrans : liste des pages, lecture, édition, navigation par hash (#/pages/<id>)
    api.ts            Accès aux données : API HTTP (serveur) ou localStorage (version statique)
    dom.ts            Petits utilitaires DOM (création d'éléments, message d'erreur, dates)
public/               index.html et style.css ; le front compilé va dans public/js/
scripts/              build-static.mjs (version statique), serve-static.mjs (test local)
tests/                Tests node:test : modèle de page (pages.test.ts) et API HTTP (api.test.ts)
```

En mode statique, `client/api.ts` appelle directement ces mêmes fonctions de `shared/pages.ts` et enregistre la base dans le `localStorage` : il n'y a pas de serveur ni de routes `/api`. Le choix du mode se fait par `<meta name="app-storage">` dans `index.html` (`server` en développement, `local` dans la version statique).

Flux d'une requête : `app.ts` lit la requête, appelle une fonction de `shared/pages.ts` sur la base en mémoire (`store.data`), puis `store.save()` écrit le fichier JSON. Les erreurs de validation sont des `HttpError` renvoyées en JSON `{ "error": "…" }`.

### API (JSON)

| Méthode | Route | Effet |
|---------|-------|-------|
| GET | `/api/pages` | Liste des pages (id, titre, date de modification) |
| POST | `/api/pages` | Crée une page (`title`, `blocks` optionnel) |
| GET | `/api/pages/:id` | Lit une page avec ses blocs |
| PUT | `/api/pages/:id` | Modifie le titre et/ou les blocs |
| DELETE | `/api/pages/:id` | Supprime la page |

### Où ajouter une fonctionnalité

Données : `src/shared/types.d.ts` · règles : un nouveau module à côté de `shared/pages.ts`, utilisable par le serveur et par la version statique · routes : `app.ts` · écran : `src/client/` · tests : un fichier `tests/*.test.ts`. Le build compile `src/` vers `dist/` (serveur) et `public/js/` (front). Une fonctionnalité qui passe par une route `/api` n'existe pas dans la version statique tant que `client/api.ts` ne la fournit pas aussi en `localStorage`.

## Pour les animateurs

Une solution de référence complète existe sur la branche `solution-commentaires` du dépôt. Ne pas la partager aux participants avant la fin de l'atelier.

## Suivi

Une PR par story, qui référence la clé Jira (`AS2-…`) ; voir le [guide](../guide-participant/index.html).
