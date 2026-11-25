# Application « notion like »

Petite application de type Notion : des **pages** faites de blocs simples (titre, texte, liste à puces), avec création, édition, suppression et navigation entre pages. C'est la base sur laquelle les participants ajoutent des fonctionnalités pendant les ateliers.

**Stack** : Node 20+ (testé en 22), TypeScript, serveur `node:http` sans framework en local, front TypeScript sans framework, données dans **Postgres** (PGlite, un Postgres embarqué, en local). Dépendances : `pg` et `@electric-sql/pglite`. Aucune clé, aucune donnée personnelle.

## Lancer, tester

```bash
cd application-notion-like
npm install
npm run dev        # compile puis démarre sur http://localhost:3000
npm test           # tests du modèle de page et de l'API (base jetable en mémoire)
npm run typecheck  # vérification des types, serveur et front
```

En local, la base est un dossier `data/pglite` créé au premier démarrage, avec une page d'exemple ; supprimez `data/` pour repartir de zéro. Variables optionnelles (voir `.env.example`) : `PORT` (3000), `PGLITE_DIR` (`data/pglite`, ou `memory://` pour une base jetable).

## Base de données et publication

- Le schéma est dans `migrations/NNN_nom.sql` (additif uniquement : créer des tables ou ajouter des colonnes, ne jamais modifier une migration déjà publiée, ajouter un nouveau fichier). En local, PGlite les applique au démarrage ; en ligne, `npm run build` exécute `scripts/migrate.mjs` sur la base Postgres fournie par la plateforme.
- `cursor-app.json` (`{ "database": "postgres" }`) demande cette base à la plateforme de publication Cursor, qui fournit `DATABASE_URL`. Cette variable ne doit jamais être écrite dans le dépôt ni dans un `.env`.
- Les requêtes passent toutes par `sql(texte, paramètres)` dans `src/server/db.ts` : Postgres si `DATABASE_URL` est défini, PGlite sinon. Toujours passer les valeurs en paramètres (`$1`, `$2`…).
- En ligne, l'API est servie par la fonction `api/[...path].js`, qui appelle le même handler que le serveur local. Les données sont partagées entre tous les visiteurs de l'application publiée.

## Architecture

```
src/
  shared/
    types.d.ts        Modèle de données (Page, Block, PageSummary)
    validation.ts     Validation des titres et des blocs (pure, sans base ni HTTP)
  server/
    index.ts          Serveur local : fichiers de public/ et routes /api/*
    handler.ts        Routes de l'API en signature web (Request -> Response), partagées avec la fonction publiée
    pages.ts          Modèle de page : règles métier et requêtes SQL (création, édition, suppression)
    db.ts             Accès à la base : sql(), Postgres ou PGlite, migrations locales
    errors.ts         HttpError (code HTTP + message en français)
  client/
    app.ts            Écrans : liste des pages, lecture, édition, navigation par hash (#/pages/<id>)
    api.ts            Appels à l'API
    dom.ts            Petits utilitaires DOM (création d'éléments, message d'erreur, dates)
api/[...path].js      Fonction de la plateforme (utilise dist/server/handler.js)
migrations/           Schéma SQL et page d'exemple
scripts/migrate.mjs   Applique les migrations sur Postgres au build
public/               index.html et style.css ; le front compilé va dans public/js/
tests/                Tests node:test : modèle de page (pages.test.ts) et API (api.test.ts)
```

Flux d'une requête : `handler.ts` lit la requête, appelle une fonction de `pages.ts`, qui valide l'entrée (`shared/validation.ts`) puis interroge la base avec `sql()`. Les erreurs sont des `HttpError` renvoyées en JSON `{ "error": "…" }`.

### API (JSON)

| Méthode | Route | Effet |
|---------|-------|-------|
| GET | `/api/pages` | Liste des pages (id, titre, date de modification) |
| POST | `/api/pages` | Crée une page (`title`, `blocks` optionnel) |
| GET | `/api/pages/:id` | Lit une page avec ses blocs |
| PUT | `/api/pages/:id` | Modifie le titre et/ou les blocs |
| DELETE | `/api/pages/:id` | Supprime la page |

### Où ajouter une fonctionnalité

Données : une nouvelle migration `migrations/NNN_….sql` et `src/shared/types.d.ts` · règles et requêtes : un nouveau module à côté de `pages.ts` · routes : `handler.ts` · écran : `src/client/` · tests : un fichier `tests/*.test.ts`. Le build compile `src/` vers `dist/` (serveur) et `public/js/` (front).

## Pour les animateurs

Une solution de référence complète existe sur la branche `solution-commentaires` du dépôt. Ne pas la partager aux participants avant la fin de l'atelier. Elle date d'avant le passage à Postgres : elle stocke dans un fichier JSON.

## Suivi

Une PR par story, qui référence la clé Jira (`AS2-…`) ; voir le [guide](../guide-participant/index.html).
