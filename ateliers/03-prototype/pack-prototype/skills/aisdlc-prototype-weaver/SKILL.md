---
name: aisdlc-prototype-weaver
description: >
  Atelier 3 Prototype · Prototype Weaver. Pose les interactions cliquables
  Figma (hotspots, navigate/overlay), génère le lien de partage view-only,
  écrit figma.yaml conforme au schéma pivot, et commente le ticket Jira Story.
  À utiliser après UX Composer, en bout de chaîne Prototype.
---

# Skill — Prototype Weaver (Prototype)

## Quand activer

- Entrée : liste des `node_id` (UX Composer) + `flow.yaml` (Flow Mapper).
- Objectif : `docs/prototype/<story-key>/figma.yaml` + prototype cliquable + commentaire Jira.

## Workflow

1. Relire `flow.yaml` et la liste des `node_id`.
2. Pour chaque step non terminal : créer une connection prototype
   (`on_tap` → `navigate_to` | `open_overlay` | `close_overlay`, 150 ms).
3. Remplir `covers_acceptance_criteria[]` par flow (union des AC couverts).
4. Générer le lien de partage **view-only** (`prototype_url`).
5. Écrire `figma.yaml` conforme à `pivots/figma.schema.yaml`.
6. Commenter le ticket Jira Story : `[Prototype] <lien>`.
7. Statut `ready_for_code` seulement si **tous** les AC de la US sont couverts ; sinon `in_progress` + `open_question`.

## Format de sortie

Voir `pivots/figma.schema.yaml` et `examples/figma.yaml`.

## Garde-fous

- Pas de nouvelles frames ni composants (rôle d'UX Composer).
- Pas d'écriture GitHub / Chat.
- Pas d'animation personnalisée en V1.
- Appliquer `aisdlc.prototype.prototype-weaver` + `aisdlc.team.base`.

## Mode Cursor associé

`aisdlc.prototype.prototype-weaver`.
