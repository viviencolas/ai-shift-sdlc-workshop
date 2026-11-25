# Guide facilitateur — Atelier 1 · Discover

> **Lead** : Ilyasse EL KHAIRA · **Lundi 17 h – 19 h** · 20 participants, 4 sous-groupes de 5.
> **Objectif** : chaque sous-groupe sort 3 à 5 opportunités scorées RICE, publiées dans Jira, prêtes à alimenter Specify (mardi).

## Checklist pré-session (J-1, 30 min max)

- [ ] Les 20 participants ont rejoint le **Cursor Team « AI SDLC »** et vu `aisdlc.team.smoke-test` au vert.
- [ ] Le Jira project `AISDLC` a bien le type d'issue `Opportunity` + le label `aisdlc:opportunity`.
- [ ] Le space Confluence `AISDLC/raw/` contient au moins 20 verbatims de démo (vérifier `AISDLC/raw/W46`).
- [ ] Le space Google Chat `#aisdlc-feedback-demo` est peuplé des verbatims de démo (20 messages min).
- [ ] 4 jeux de verbatims, 1 par sous-groupe, sont étiquetés `verticale: support | nps | interview | chat`.
- [ ] Les 3 custom modes du squad sont activés côté participants :
      `aisdlc.discover.signal-hunter`, `aisdlc.discover.insight-synth`, `aisdlc.discover.opportunity-scorer`.
- [ ] Un poste « backup » (laptop facilitateur) avec un token Jira valide prêt en cas de panne MCP sur un participant.

## Timing détaillé (17 h – 19 h)

| Heure | Durée | Phase | Détail |
|---|---|---|---|
| 17 h 00 | 15 min | Accueil | Rappel pipeline + les 3 agents + schéma `opportunity.schema.yaml`. Montrer le livrable attendu : fichier YAML + ticket Jira. |
| 17 h 15 | 20 min | Démo guidée | Ilyasse joue les 3 agents sur un verbatim set « canon » (réutiliser `examples/opportunity.yaml` comme sortie cible). |
| 17 h 35 | 65 min | Lab | 4 sous-groupes travaillent leur verticale. Facilitateur circule, débloque les MCP. |
| 18 h 40 | 20 min | Restitution | 3 min/groupe + vote (sticker) pour top 5. Les 5 opportunités retenues reçoivent le status `selected_for_specify`. |

## Prompts de lancement (à coller tels quels dans Composer)

**Signal Hunter**
```
Mode: aisdlc.discover.signal-hunter
Cible : verticale « <verticale_du_groupe> » (ex: support).
Sources : Jira type=Support + Confluence AISDLC/raw/W46 + Chat #aisdlc-feedback-demo.
Fenêtre : 2026-11-01 → 2026-11-10.
Sortie attendue : docs/discover/<slug-opportunity>/raw-verbatims.json (dédoublonné).
```

**Insight Synth** (à lancer après Signal Hunter)
```
Mode: aisdlc.discover.insight-synth
Entrée : docs/discover/<slug>/raw-verbatims.json.
Sortie : docs/discover/<slug>/clusters.yaml.
Contrainte : clusters mono-source → status: weak.
```

**Opportunity Scorer** (à lancer après Insight Synth)
```
Mode: aisdlc.discover.opportunity-scorer
Entrée : docs/discover/<slug>/clusters.yaml.
Sortie : docs/discover/<slug>/opportunity.yaml conforme à pivots/opportunity.schema.yaml
        + ticket Jira type=Opportunity, labels aisdlc:opportunity, aisdlc:workshop-mon.
Statut initial : discovered puis scored. Le passage à selected_for_specify reste humain.
```

## Moments-clés où le facilitateur intervient

- **17 h 25** : premier passage Signal Hunter → Insight Synth. Vérifier que `evidence_refs[]` pointe bien aux `source_id`.
- **18 h 00** : premier calcul RICE. Challenger les scores (surtout `impact` et `confidence`).
- **18 h 35** : ultime check : chaque opportunité a ≥ 3 `evidence` et un `parent_jira_key`.

## Critères de clôture (go/no-go pour Specify)

- [ ] 3 à 5 opportunités scorées par sous-groupe, soit 12–20 au total.
- [ ] Top 5 voté, statut `selected_for_specify`, labels à jour dans Jira.
- [ ] Les fichiers `opportunity.yaml` des 5 opportunités retenues sont versés dans le store partagé
      sous `docs/discover/<id>/opportunity.yaml` **et** valident le schéma (`pnpm run validate:pivots`).
- [ ] Le facilitateur a publié un récap 5 lignes dans `#aisdlc-standup` (manuel).

## Pièges fréquents

- **Oublier la langue d'origine des verbatims** : Signal Hunter doit la conserver, Insight Synth peut traduire en commentaire.
- **Score RICE inventé** : si un champ RICE est incertain, préférer `null` + `open_question` plutôt qu'un chiffre « au doigt ».
- **Groupes mono-source** : un cluster de 3 tickets du même client est `status: weak`, pas une opportunité.
