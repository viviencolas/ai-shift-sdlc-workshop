---
name: aisdlc-prototype-flow-mapper
description: >
  Atelier 3 Prototype · Flow Mapper. Lit les user stories Jira AS2 du participant
  (reporter = currentUser, label prete), les normalise vers le pivot, puis déduit
  les user flows. Ne crée jamais de frame Figma.
---

# Skill — Flow Mapper (Prototype)

## Quand activer

- Entrée live : Jira **AS2**, JQL
  `project = AS2 AND reporter = currentUser() AND labels = prete`
- Chaque participant = sa propre epic ; stories enfants. **AS2-3** = démo seulement.
- Cache local : `docs/prototype/<story-key>/user-story.yaml`
- Objectif : `flow.yaml` + `flow.md` (mermaid)

## Workflow

1. Chercher les stories via la JQL ci-dessus. Refuser `brouillon`.
2. Parser la description **rendue** (gabarit Specify) :
   - `## Récit` → `as_a` / `i_want` / `so_that`
   - `## Critères d'acceptation` → `Scenario: AC-N · …` Given/When/Then (1 ligne chacun) ; **pas de plafond** sur le nombre
   - Pas de section Effort : `effort_estimate_days` optionnel, ne pas inventer
   - `## Écrans, données et états` → indices steps
   - `## Valeur et mesure` → sidecar, ignorer pour le pivot
   - `## Estimation IA` → destinée au jour 5 Code ; **ignorer** (ne bloque pas `prete`)
3. Écrire le cache YAML. Stop si un champ obligatoire manque.
4. Happy path + AC edge / erreur / vide.
5. Steps = verbes d'action utilisateur ; `covers: [AC-n]`.
6. Écrire `flow.yaml` + `flow.md`. Alerter les AC non couverts.

## Garde-fous

- Lecture seule Jira / Figma.
- Pas d'export YAML Specify ; pas de label `participant-pXX`.
- `code_hints` / `design_hints` non attendus.
- Transmettre à **UX Composer**. Rule `aisdlc.prototype.flow-mapper` + `aisdlc.team.base`.

## Mode Cursor associé

`aisdlc.prototype.flow-mapper`
