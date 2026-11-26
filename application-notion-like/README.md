# Application « notion like »

Petite application de type Notion : des **pages** faites de blocs simples (titre, texte, liste à puces), avec création, édition, suppression et navigation entre pages. C'est la base sur laquelle les participants ajoutent des fonctionnalités pendant les ateliers.

**Stack** : Node 20+ (testé en 22), TypeScript, serveur `node:http` sans framework en local, front TypeScript sans framework, données dans **Postgres** (Neon sur Vercel, PGlite — un Postgres embarqué — en local). Dépendances : `pg` ; `@electric-sql/pglite` en développement seulement. Aucune clé, aucune donnée personnelle.

## Lancer, tester

```bash
cd application-notion-like
npm install
npm run dev        # compile puis démarre sur http://localhost:3000
npm test           # tests du modèle de page et de l'API (base jetable en mémoire)
npm run typecheck  # vérification des types, serveur et front
```

En local, la base est un dossier `data/pglite` créé au premier démarrage, avec une page d'exemple ; supprimez `data/` pour repartir de zéro. Variables optionnelles (voir `.env.example`) : `PORT` (3000), `PGLITE_DIR` (`data/pglite`, ou `memory://` pour une base jetable).

## Base de données

- Le schéma est dans `migrations/NNN_nom.sql` (additif uniquement : créer des tables ou ajouter des colonnes ; ne jamais modifier une migration déjà appliquée, ajouter un nouveau fichier). En local, PGlite les applique au démarrage ; sur Vercel, `npm run build` exécute `scripts/migrate.mjs` sur la base Neon.
- Les requêtes passent toutes par `sql(texte, paramètres)` dans `src/server/db.ts` : Postgres si `DATABASE_URL` est défini, PGlite sinon (en local uniquement). Toujours passer les valeurs en paramètres (`$1`, `$2`…).
- `DATABASE_URL` ne doit jamais être écrit dans le dépôt ni dans un fichier `.env` commité.

## Déployer sur Vercel (avec Neon)

Démo en ligne : https://notion-like-theta.vercel.app (projet Vercel `notion-like`, base Neon `notion-like-db`).

Le projet s'importe tel quel : `vercel.json` fixe la commande de build (`npm run build` : compilation, puis migrations) et le dossier de sortie (`public/`) ; les routes de l'API sont les fonctions `api/pages/index.js` et `api/pages/[id].js`. Seule variable nécessaire : `DATABASE_URL`, fournie par l'intégration Neon.

Procédure (une fois, avec un compte GitHub) :

1. Aller sur [vercel.com/signup](https://vercel.com/signup) et choisir **Continue with GitHub** (l'offre gratuite « Hobby » suffit).
2. **Add New… > Project**, puis dans « Import Git Repository » choisir `viviencolas/ai-shift-sdlc-workshop`. Si le dépôt n'apparaît pas, cliquer sur « Adjust GitHub App Permissions » et autoriser ce dépôt.
3. Sur l'écran de configuration, à côté de **Root Directory**, cliquer sur **Edit** et choisir `application-notion-like`. Laisser « Framework Preset : Other » et les commandes par défaut (elles viennent de `vercel.json`). Ne rien saisir dans « Environment Variables ».
4. Cliquer sur **Deploy**. Ce premier déploiement **échoue volontairement** avec le message « DATABASE_URL manquant » : la base n'existe pas encore.
5. Dans le projet, onglet **Storage > Create Database** (ou « Marketplace »), choisir **Neon**, accepter les conditions, garder la région proposée et créer la base. À la question « Connect to project », choisir ce projet et cocher les environnements Production et Preview. Neon ajoute alors `DATABASE_URL` (vérifiable dans **Settings > Environment Variables**).
6. Onglet **Deployments**, ouvrir le dernier déploiement, menu **… > Redeploy**. Cette fois le build crée les tables et la page d'exemple, puis le site est en ligne.
7. L'URL publique est affichée sur le projet (forme `https://<projet>.vercel.app`, voir aussi **Settings > Domains**). Chaque `push` sur `main` redéploie automatiquement. Si l'URL demande une connexion Vercel, aller dans **Settings > Deployment Protection** et désactiver la protection pour la production.

Test après déploiement (depuis un clone du dépôt, Node 20+, sans `npm install`) :

```bash
cd application-notion-like
npm run smoke -- https://<projet>.vercel.app
```

Le script crée une page, la relit, la modifie, la retrouve dans la liste, la supprime et s'arrête à la première erreur (code de sortie non nul). Puis ouvrir l'URL dans deux navigateurs : une page créée dans l'un doit apparaître dans l'autre après rechargement.

## Architecture

```
src/
  shared/
    types.d.ts        Modèle de données (Page, Block, PageSummary)
    validation.ts     Validation des titres et des blocs (pure, sans base ni HTTP)
  server/
    index.ts          Serveur local : fichiers de public/ et routes /api/*
    handler.ts        Routes de l'API en signature web (Request -> Response), partagées avec les fonctions Vercel
    pages.ts          Modèle de page : règles métier et requêtes SQL (création, édition, suppression)
    db.ts             Accès à la base : sql(), Postgres ou PGlite, migrations locales
    errors.ts         HttpError (code HTTP + message en français)
  client/
    app.ts            Écrans : liste des pages, lecture, édition, navigation par hash (#/pages/<id>)
    api.ts            Appels à l'API
    dom.ts            Petits utilitaires DOM (création d'éléments, message d'erreur, dates)
api/pages/            Fonctions Vercel (index.js, [id].js) : appellent dist/server/handler.js
vercel.json           Configuration du build et de la sortie pour Vercel
migrations/           Schéma SQL et page d'exemple
scripts/migrate.mjs   Applique les migrations sur Postgres au build
  scripts/smoke.mjs   Test de fumée d'un déploiement (npm run smoke -- <url>)
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
