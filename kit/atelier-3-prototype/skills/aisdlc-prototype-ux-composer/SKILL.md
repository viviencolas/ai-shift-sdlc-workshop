---
name: aisdlc-prototype-ux-composer
description: >
  Atelier 3 Prototype · UX Composer. Assemble les écrans Figma (frames +
  instances du design system AI SDLC DS) à partir d'un flow.yaml. À utiliser
  après Flow Mapper et avant Prototype Weaver. N'ajoute jamais les interactions
  cliquables.
---

# Skill — UX Composer (Prototype)

## Quand activer

- Entrée : `docs/prototype/<story-key>/flow.yaml`.
- Objectif : créer une page Figma `<story-key>` dans `AISDLC — Prototypes`, une frame par step.

## Workflow

1. Lire `flow.yaml` et lister les steps.
2. Ouvrir la bibliothèque **AI SDLC DS** en lecture seule (MCP Figma).
3. Pour chaque step : créer une frame + instances de composants DS (pas de détachement).
4. Description de chaque frame : `story_key`, `step_id`, liste des AC visualisés.
5. Libellés en français, copy issu des AC — pas de lorem ipsum.
6. Si un composant manque dans le DS → `open_question` et **stop** sur ce flow.
7. En fin de run : imprimer la liste des `node_id` créés, triée par flow + step.

## Garde-fous

- Écriture Figma uniquement dans `AISDLC — Prototypes`.
- Interdiction de modifier `AI SDLC DS`.
- Interdiction de supprimer des pages/frames dont tu n'es pas l'auteur dans le run.
- Pas d'interactions cliquables (rôle de **Prototype Weaver**).
- Pas d'écriture Jira sauf invitation humaine explicite.
- Appliquer `aisdlc.prototype.ux-composer` + `aisdlc.team.base`.

## Mode Cursor associé

`aisdlc.prototype.ux-composer`.
