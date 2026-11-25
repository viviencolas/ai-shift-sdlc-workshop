# Application « notion like »

Petite application de type Notion : des **pages** faites de blocs simples (titre, texte, liste à puces) et, sur chaque page, des **commentaires en fil** comme dans nos epics et user stories Jira.

**Stack** : Node 20+ (testé en 22), TypeScript, serveur `node:http` sans framework, front en TypeScript sans framework, données dans un fichier JSON local (`data/db.json`). Aucune base externe, aucune clé, aucune donnée personnelle.

## Lancer, tester, héberger

```bash
cd application-notion-like
npm install
npm run dev        # compile puis démarre sur http://localhost:3000
npm test           # tests (création de page, commentaires, réponses, droits)
```

Variables optionnelles (voir `.env.example`) : `PORT` (3000), `DATA_FILE` (`data/db.json`). Le fichier de données est créé au premier démarrage avec une page d'exemple.

**Héberger gratuitement (Render)** : créer un « Web Service » depuis ce dépôt, dossier racine `application-notion-like` (le `render.yaml` fournit les commandes : build `npm ci && npm run build`, démarrage `npm start`). Fly.io, Railway ou tout hébergeur Node fonctionnent avec les mêmes deux commandes. Attention : le disque gratuit de Render est éphémère, les données repartent de la page d'exemple à chaque redéploiement ou réveil ; pour les conserver, monter un disque persistant et pointer `DATA_FILE` dessus.

## Règles de commentaires reprises du dépôt

Source : epic de démo « Gestion des commentaires », US-02 « Répondre à un commentaire et résoudre le fil » et US-06 (`guide-participant/jour-2-specify.html`, `ateliers/02-specify/supports/`).

- On peut commenter **la page entière ou un passage** (un bloc). Chaque commentaire affiche son **auteur et sa date**.
- On **répond dans le même fil** : la réponse apparaît sous le commentaire d'origine (AC-1).
- Un membre éditeur **résout** le fil : il est marqué « Résolu » et sort de la liste des fils ouverts (AC-2) ; il peut aussi le **rouvrir**.
- Une **nouvelle réponse sur un fil résolu le rouvre** (AC-3).
- Un **lecteur seul peut commenter et répondre, mais pas résoudre**, ni créer ou modifier une page (AC-4, décision PO du kit).
- États gérés : aucun fil, ouvert, résolu, rouvert, droits insuffisants.

Hors périmètre, comme dans l'epic de démo : @mentions, assignation, centre de notifications, temps réel, email ou push, emoji, échéances.

## Identité de démonstration

Il n'y a pas d'authentification. Un sélecteur en haut à gauche choisit un utilisateur fictif (Léa et Hugo : éditeurs, Sami : lecteur seul) ; le navigateur l'envoie dans l'en-tête `X-User`. À remplacer par une vraie authentification avant tout usage réel.

## API (JSON)

`GET /api/pages` · `POST /api/pages` · `GET|PUT /api/pages/:id` · `POST /api/pages/:id/threads` (nouveau commentaire, `blockId` optionnel) · `POST /api/pages/:id/threads/:threadId/replies` · `POST …/resolve` · `POST …/reopen`

## Suivi

Une PR par story, qui référence la clé Jira (`AS2-…`) ; voir le [guide](../guide-participant/index.html).
