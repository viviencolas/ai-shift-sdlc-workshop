# Guide facilitateur — Atelier 2 · Specify

> **Lead** : Vivien COLAS · **Mardi 17 h – 19 h** · 20 participants, 4 sous-groupes de 5.
> **Objectif** : chaque sous-groupe transforme 1 opportunité en 3 à 6 US « agent-ready » publiées dans Jira, prêtes pour Prototype **et** Quality en parallèle.

## Checklist pré-session (J-1, 30 min max)

- [ ] Le top 5 des opportunités de lundi est bien `selected_for_specify` dans Jira.
- [ ] Les 5 fichiers `docs/discover/<id>/opportunity.yaml` existent et valident le schéma.
- [ ] Le repo `aisdlc-sandbox` est accessible en **lecture** par tous (droit `Read`), hub Figma `AI SDLC DS` accessible.
- [ ] Les 4 custom modes du squad sont activés :
      `aisdlc.specify.story-shaper`, `aisdlc.specify.context-enricher`, `aisdlc.specify.acceptance-architect`, `aisdlc.specify.jira-scribe`.
- [ ] Le champ custom Jira `Acceptance Criteria` existe sur le type `Story` (sinon fallback section dédiée).
- [ ] Le label `aisdlc:open-question` est créé (pour les sous-tâches de clarification).

## Timing détaillé (17 h – 19 h)

| Heure | Durée | Phase | Détail |
|---|---|---|---|
| 17 h 00 | 10 min | Accueil | Rappel : sortie Specify = entrée **commune** Prototype + Quality. Afficher `user-story.schema.yaml`. |
| 17 h 10 | 20 min | Démo | Vivien joue le squad sur une 6ᵉ opportunité démo. Montrer le relais Story Shaper → Context Enricher. |
| 17 h 30 | 70 min | Lab | 4 sous-groupes, 1 opportunité chacun. Objectif : 3 à 6 US publiées en Jira. |
| 18 h 40 | 20 min | Restitution | Chaque groupe donne 1 US au groupe voisin qui joue Quality et traque 1 ambiguïté. Préfigure J4. |

## Prompts de lancement (Composer)

**Story Shaper**
```
Mode: aisdlc.specify.story-shaper
Entrée : docs/discover/<id>/opportunity.yaml (statut selected_for_specify).
Sortie : docs/specify/<opportunity-id>/stories-draft.yaml (3 à 6 stories INVEST, ≤ 3j).
Pas d'écriture Jira à cette étape.
```

**Context Enricher**
```
Mode: aisdlc.specify.context-enricher
Entrée : docs/specify/<opportunity-id>/stories-draft.yaml.
Accès : lecture repo aisdlc-sandbox + Figma team AI SDLC.
Sortie : docs/specify/<opportunity-id>/stories-enriched.yaml avec code_hints[] et design_hints[].
Au moins un hint par story, sinon open_question + blocked_context: true.
```

**Acceptance Architect**
```
Mode: aisdlc.specify.acceptance-architect
Entrée : stories-enriched.yaml.
Sortie : docs/specify/<opportunity-id>/stories-final.yaml conforme à user-story.schema.yaml.
Gherkin ≤ 5 scénarios/US, valeurs concrètes, 1 happy path + 1 edge case min.
```

**Jira Scribe** (lancer après validation humaine rapide)
```
Mode: aisdlc.specify.jira-scribe
Entrée : stories-final.yaml.
Sortie : tickets Jira Story + fichier user-story.yaml par story (une fois les keys connues).
Labels : aisdlc:story, aisdlc:workshop-tue, aisdlc:squad-<n>.
Lien obligatoire vers l'Opportunity parent.
```

## Moments-clés

- **17 h 22** : relais Story Shaper → Context Enricher. Vérifier qu'au moins un `code_hints` ou `design_hints` existe par story.
- **17 h 55** : premier Gherkin rédigé. Challenger : « cette valeur est-elle concrète ? »
- **18 h 35** : check pré-publication Jira — tous les parents sont bien liés.

## Critères de clôture (go/no-go pour Prototype + Quality)

- [ ] 12 à 24 stories Jira ouvertes au total (3 à 6 par sous-groupe), toutes liées à leur Opportunity.
- [ ] Chaque story : `acceptance_criteria[]` ≥ 1, `code_hints` **ou** `design_hints` ≥ 1, `effort_estimate_days` ≤ 3.
- [ ] Statut `ready_for_proto_and_qa` pour celles qui n'ont pas d'`open_question` bloquante.
- [ ] Les fichiers `docs/specify/<story-key>/user-story.yaml` existent et valident le schéma.
- [ ] Récap posté manuellement dans `#aisdlc-standup`.

## Pièges fréquents

- **Story trop grosse** : si `effort_estimate_days` > 3, scinder immédiatement.
- **Hint fantôme** : Context Enricher propose un chemin qui n'existe pas. Vérifier avec `github:get_file_contents`.
- **AC flous** : « un utilisateur voit une erreur » n'est pas testable. Forcer valeurs concrètes.
