# Guide facilitateur — Atelier 5 · Code

> **Lead** : Patrick BLOT · **Vendredi 17 h – 19 h** · 20 participants, 4 sous-groupes de 5.
> **Objectif** : chaque sous-groupe sort **1 PR verte** sur `aisdlc-sandbox`, Story Jira transitionnée en `In Review`, Chat `#aisdlc-standup` notifié.

## Checklist pré-session (J-1, 60 min max — le plus technique)

- [ ] Repo `aisdlc-sandbox` à jour sur `main`, CI verte à l'instant T.
- [ ] Branch protection active : push direct sur `main` **refusé**, require PR + 1 review.
- [ ] Pre-commit `trufflehog` installé (`scripts/setup.sh` exécuté par chaque participant).
- [ ] Node ≥ 20 et pnpm ≥ 9 vérifiés chez chaque participant (commande `scripts/doctor.sh`).
- [ ] Les 4 custom modes activés : `aisdlc.code.context-loader`, `aisdlc.code.planner`, `aisdlc.code.implementer`, `aisdlc.code.reviewer`.
- [ ] `.github/CODEOWNERS` prêt : rotation des reviewers humains préparée par Patrick.
- [ ] Les stories choisies ont : `user-story.yaml` + `figma.yaml` (`ready_for_code`) + `test-plan.yaml` (`ready_for_code`).
- [ ] Attribution : 1 story simple par sous-groupe (viser `effort_estimate_days ≤ 1` pour tenir 2 h).

## Timing détaillé (17 h – 19 h)

| Heure | Durée | Phase | Détail |
|---|---|---|---|
| 17 h 00 | 10 min | Accueil | Rappel contrat : harnais sous contrôle. Montrer le checkpoint humain à la fin du Planner. |
| 17 h 10 | 30 min | Démo | Patrick joue le squad sur 1 US simple. Montrer **arrêt automatique** sur test rouge, puis récupération. |
| 17 h 40 | 70 min | Lab | 4 sous-groupes, 1 PR chacun. Checkpoints humains obligatoires à chaque fin de step. |
| 18 h 50 | 10 min | Restitution | Chaque groupe montre sa PR, CI verte, et le message auto `#aisdlc-standup`. |

## Prompts de lancement (Composer)

**Context Loader**
```
Mode: aisdlc.code.context-loader
Entrée : AISDLC-<n> (user-story.yaml + figma.yaml + test-plan.yaml).
Sortie : docs/code/<story-key>/briefing.md + snippets lecture seule.
Valider les 3 schémas pivots avant tout. Stop si l'un invalide.
```

**Planner** (checkpoint humain requis)
```
Mode: aisdlc.code.planner
Entrée : briefing.md + snippets.
Sortie : docs/code/<story-key>/plan.yaml (5-10 steps, chaque < 50 lignes diff) + plan.md (mermaid).
approved: false par défaut. Demande validation humaine explicite avant d'autoriser Implementer.
```

**Implementer** (uniquement après `approved: true` humain sur plan.yaml)
```
Mode: aisdlc.code.implementer
Entrée : plan.yaml (approved: true).
Sortie : branche cursor/<story-key>-<slug>-6c26 + commits step by step.
Allowlist shell stricte. Stop sur test rouge. Jamais désactiver un test.
```

**Reviewer** (après tous les steps done, branche à jour sur origin)
```
Mode: aisdlc.code.reviewer
Entrée : branche cursor/<story-key>-<slug>-6c26 + plan.yaml + test-plan.yaml + user-story.yaml.
Sortie : PR GitHub + Jira transitionnée In Review + message Chat #aisdlc-standup.
Si CI rouge : PR en draft, commentaire ciblé, pas de message Chat.
Si un AC non couvert : stop, commentaire Jira, pas de message Chat.
```

## Moments-clés où le facilitateur intervient

- **17 h 20** : première validation humaine du plan. Prendre 2 min pour expliquer le checkpoint au groupe en difficulté.
- **17 h 55** : premier commit atomique. Lire le message et confirmer qu'il cite l'AC et le step id.
- **18 h 30** : si un test est rouge, **ne pas** laisser l'agent contourner. Débloquer humainement.
- **18 h 50** : pré-restitution : pour chaque sous-groupe, vérifier la case AC dans le corps de PR.

## Critères de clôture

- [ ] 4 PR ouvertes (1 par sous-groupe), CI **verte**, `ready_for_review`, pas en draft.
- [ ] Chaque PR : lien Jira + lien Figma + checklist AC + checklist TC.
- [ ] Story Jira transitionnée en `In Review`, label `aisdlc:story` conservé.
- [ ] Message Chat auto `#aisdlc-standup` `✅ [<story-key>] PR #<n> prête · … · AC couverts <x>/<y>`.
- [ ] Un reviewer humain est assigné par `request_review` (jamais self-approve).

## Pièges fréquents

- **Agent qui désactive un test** : refus immédiat, revert. Rappeler la règle `aisdlc.code.implementer`.
- **Plan non validé** : Implementer doit **stopper** si `approved: false`. Si l'agent ignore, vérifier la rule.
- **PR sans Jira link** : le Reviewer est censé l'ajouter ; sinon faire-le à la main et remonter la lacune.
- **Dérive scope** : l'Implementer touche des fichiers hors `files_touched[]` du plan. Stop + relancer un sous-plan.
