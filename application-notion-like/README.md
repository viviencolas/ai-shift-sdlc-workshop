# Application « notion like »

Petite application de type Notion : des **pages** faites de blocs simples (titre, texte, liste à puces), avec création, édition, suppression et navigation entre pages. C'est la base sur laquelle les participants ajoutent des fonctionnalités pendant les ateliers.

**Stack** : Node 20+ (testé en 22), TypeScript, serveur `node:http` sans framework, front TypeScript sans framework, données dans un fichier JSON local. Aucune base externe, aucune clé, aucune donnée personnelle.

## Lancer, tester, héberger

```bash
cd application-notion-like
npm install
npm run dev        # compile puis démarre sur http://localhost:3000
npm test           # tests unitaires et API (node:test)
npm run typecheck  # vérification des types, serveur et front
```

Variables optionnelles (voir `.env.example`) : `PORT` (3000), `DATA_FILE` (`data/db.json`). Le fichier de données est créé au premier démarrage avec une page d'exemple ; supprimez `data/` pour repartir de zéro.

**Héberger gratuitement (Render)** : créer un « Web Service » depuis ce dépôt, dossier racine `application-notion-like` (le `render.yaml` fournit build `npm ci && npm run build` et démarrage `npm start`). Tout hébergeur Node fonctionne avec les mêmes commandes. Le disque gratuit de Render est éphémère : les données repartent de la page d'exemple à chaque redéploiement.

## Architecture

```
src/
  shared/types.d.ts   Modèle de données partagé serveur / front (Page, Block, Database…)
  server/
    index.ts          Point d'entrée : lit PORT et DATA_FILE, démarre le serveur
    app.ts            Serveur HTTP : routes /api/*, fichiers statiques de public/
    pages.ts          Modèle de page : règles et validation (création, édition, suppression)
    storage.ts        Stockage : charge et écrit data/db.json (écriture atomique)
    errors.ts         HttpError (code HTTP + message en français)
  client/
    app.ts            Écrans : liste des pages, lecture, édition, navigation par hash (#/pages/<id>)
    api.ts            Appels à l'API
    dom.ts            Petits utilitaires DOM (création d'éléments, message d'erreur, dates)
public/               index.html et style.css, servis tels quels ; le front compilé va dans public/js/
tests/                Tests node:test : modèle de page (pages.test.ts) et API HTTP (api.test.ts)
```

Flux d'une requête : `app.ts` lit la requête, appelle une fonction de `pages.ts` sur la base en mémoire (`store.data`), puis `store.save()` écrit le fichier JSON. Les erreurs de validation sont des `HttpError` renvoyées en JSON `{ "error": "…" }`.

### API (JSON)

| Méthode | Route | Effet |
|---------|-------|-------|
| GET | `/api/pages` | Liste des pages (id, titre, date de modification) |
| POST | `/api/pages` | Crée une page (`title`, `blocks` optionnel) |
| GET | `/api/pages/:id` | Lit une page avec ses blocs |
| PUT | `/api/pages/:id` | Modifie le titre et/ou les blocs |
| DELETE | `/api/pages/:id` | Supprime la page |

### Où ajouter une fonctionnalité

Données : `src/shared/types.d.ts` · règles : un nouveau module à côté de `pages.ts` · routes : `app.ts` · écran : `src/client/` · tests : un fichier `tests/*.test.ts`. Le build compile `src/` vers `dist/` (serveur) et `public/js/` (front).

## Pour les animateurs

Une solution de référence complète existe sur la branche `solution-commentaires` du dépôt. Ne pas la partager aux participants avant la fin de l'atelier.

## Suivi

Une PR par story, qui référence la clé Jira (`AS2-…`) ; voir le [guide](../guide-participant/index.html).
