# Guide facilitateur — Atelier 3 · Prototype

> **Lead** : Yassine AQEJJAJ · **Mercredi 17 h – 19 h** · 20 participants, 4 sous-groupes de 5.
> **Objectif** : chaque sous-groupe produit 1 à 3 prototypes Figma cliquables alimentés par des US Specify (Jira AS2), livre `figma.yaml` conforme.

## Alignement Specify (nov 2026)

- **Pas d'export YAML** en sortie du jour 2. Entrée = **Jira projet AS2**.
- Labels : `prete` = `ready_for_proto_and_qa` (seules celles-ci) ; `brouillon` = refusées.
- Filtre participant : **`reporter = currentUser()`** (plus de label `participant-pXX`).
- JQL type : `project = AS2 AND reporter = currentUser() AND labels = prete`.
- Pas de clé d’epic saisie : on retrouve les issues par **créateur** (`reporter = currentUser()`). **AS2-3** = démo uniquement.
- AC-N : nombre **non plafonné** ; `effort_estimate_days` **optionnel** (section Effort retirée du gabarit).
- Clés live : **`AS2-*`**. Flow Mapper normalise Jira → cache local.

## Checklist pré-session (J-1, 45 min max — plus lourd côté Figma)

- [ ] La bibliothèque Figma `AI SDLC DS` est **publiée** (version ≥ 1.3.0) et accessible en lecture.
- [ ] Le fichier Figma `AISDLC — Prototypes` existe dans la team `AI SDLC`, droits `Can edit` pour tous.
- [ ] Chaque participant voit ses stories via `reporter = currentUser()` + label **`prete`**.
- [ ] MCP Atlassian authentifié ; lecture AS2 OK (compte = rapporteur).
- [ ] Les 3 custom modes activés : `aisdlc.prototype.flow-mapper`, `aisdlc.prototype.ux-composer`, `aisdlc.prototype.prototype-weaver`.
- [ ] Consigne lab : ne pas prendre AS2-3 (démo) ; viser ~2 US `prete` par participant / binôme.
- [ ] Vérifier qu'aucun custom mode Prototype ne pointe la bibliothèque `AI SDLC DS` en écriture (lecture seule).

## Timing détaillé (17 h – 19 h)

| Heure | Durée | Phase | Détail |
|---|---|---|---|
| 17 h 00 | 10 min | Accueil | Rappel : Prototype et Quality consomment la **même** entrée Jira. Pas de dépendance entre eux. |
| 17 h 10 | 25 min | Démo | Yassine joue le squad sur 1 US AS2 `prete`. Montrer : Jira → pivot cache → flow → frame → `figma.yaml` + commentaire Jira. |
| 17 h 35 | 65 min | Lab | ~2 US `prete` par participant / binôme. Visé : prototypes cliquables. |
| 18 h 40 | 20 min | Restitution | Démo croisée : chaque groupe teste le proto d'un autre et laisse 1 commentaire Figma constructif. |

## Prompts de lancement (Composer)

**Flow Mapper**
```
Mode: aisdlc.prototype.flow-mapper
Entrée JQL : project = AS2 AND reporter = currentUser() AND labels = prete
Étape 0 : normaliser → docs/prototype/AS2-<n>/user-story.yaml
Sortie : docs/prototype/AS2-<n>/flow.yaml + flow.md (mermaid).
Couvrir happy + edge/erreur. Pas de termes UI. Refuser brouillon. Effort non exigé.
```

**UX Composer**
```
Mode: aisdlc.prototype.ux-composer
Entrée : docs/prototype/AS2-<n>/flow.yaml.
Sortie : frames Figma dans AISDLC — Prototypes, page = AS2-<n>.
Utiliser uniquement AI SDLC DS. Libellés FR. Décrire chaque frame avec story_key + step_id.
```

**Prototype Weaver** (après que UX Composer a imprimé la liste des node_ids)
```
Mode: aisdlc.prototype.prototype-weaver
Entrée : liste node_ids de UX Composer + flow.yaml.
Sortie : docs/prototype/AS2-<n>/figma.yaml conforme à pivots/figma.schema.yaml
        + commentaire Jira [Prototype] <lien> sur la Story AS2-<n>.
Interactions V1 : on_tap, 150 ms, pas d'animation custom.
Statut ready_for_code uniquement si tous les AC de la story prete sont couverts.
```

## Moments-clés

- **17 h 15** : Flow Mapper a écrit le cache `user-story.yaml` depuis Jira (vérifier AC-N présents).
- **17 h 20** : UX Composer crée sa première frame. Vérifier qu'elle instancie un composant DS (pas détaché).
- **18 h 15** : Prototype Weaver publie le premier lien. Vérifier qu'il est bien view-only et commenté sur Jira.
- **18 h 35** : check `covers_acceptance_criteria[]` — union des AC du flow == AC de la story.

## Critères de clôture (go/no-go pour Code)

- [ ] 1 à 3 prototypes cliquables par sous-groupe, soit 4 à 12 au total.
- [ ] Chaque `figma.yaml` : statut `ready_for_code`, `prototype_url` valide, tous les AC couverts.
- [ ] Chaque Story Jira AS2 a reçu son commentaire `[Prototype] <lien>`.
- [ ] Les fichiers `docs/prototype/<story-key>/figma.yaml` valident le schéma.
- [ ] Pas de composant détaché de la bibliothèque DS (contrôle manuel en 1 min par groupe).

## Pièges fréquents

- **Attendre un YAML Specify** : il n'y en a pas. Lire Jira.
- **Story `brouillon`** : ne pas prototyper ; remonter à Specify.
- **Composant détaché** : UX Composer force une variation non prévue dans DS. Interdire ; ouvrir une `open_question`.
- **AC non couvert cliquablement** : revenir à Flow Mapper plutôt que de bricoler dans Figma.
- **Lien privé** : vérifier `prototype_url` **en navigation privée** avant restitution.
