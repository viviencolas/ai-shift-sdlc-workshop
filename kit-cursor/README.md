# Kit Cursor — AI SDLC

> Kit installable qui monte 5 squads d'agents Cursor (3 à 4 agents chacun) pour
> le cycle d'ateliers **Discover → Specify → Prototype ∥ Quality → Code**.
> Le kit contient : les **17 custom modes** + **18 rules** + **la config MCP**
> + les **4 schémas pivots** + des **exemples** cohérents + les **5 guides
> facilitateur**.
> Catalogue de référence : [`reference/catalogue-agents-plugins.md`](../reference/catalogue-agents-plugins.md).

## Table des matières

1. [Installation en 5 minutes](#1-installation-en-5-minutes)
2. [Pré-requis Cursor](#2-pré-requis-cursor)
3. [MCP à activer](#3-mcp-à-activer)
4. [Comment référencer les rules et les modes](#4-comment-référencer-les-rules-et-les-modes)
5. [Conventions d'usage pendant les ateliers](#5-conventions-dusage-pendant-les-ateliers)
6. [Arborescence du kit](#6-arborescence-du-kit)
7. [Vérifier que tout marche (smoke-test)](#7-vérifier-que-tout-marche-smoke-test)
8. [Alignement Specify → Prototype](#8-alignement-specify--prototype-nov-2026)
9. [Dette V1](#9-dette-v1)

---

## 1. Installation en 5 minutes

### Étape 1 — Copier le kit dans un projet local

Le kit est volontairement conçu pour s'installer **par-dessus** le dépôt
`aisdlc-sandbox` (ou n'importe quel projet Cursor local).

```bash
# Depuis un clone de ce dépôt :
cd ~/code/aisdlc-sandbox
bash <chemin/vers/ai-shift-sdlc-workshop>/kit-cursor/install.sh .
```

> **Note** : le kit contient un répertoire `.cursor/` que l'installateur copie
> dans la cible. Si vous préférez ne pas utiliser le script :
> `cp -R kit-cursor/.cursor <projet>/.cursor` manuellement.

### Étape 2 — Exporter les variables d'environnement MCP

```bash
# Atlassian (Jira + Confluence)
export ATLASSIAN_SITE_URL="https://<votre-instance>.atlassian.net"
export ATLASSIAN_EMAIL="<votre@email>"
export ATLASSIAN_API_TOKEN="<token créé sur id.atlassian.com/manage/api-tokens>"

# GitHub (repo autorisé : aisdlc-sandbox)
export GITHUB_TOKEN="<Personal Access Token classique, scope repo + read:org>"

# Figma (team AI SDLC)
export FIGMA_API_TOKEN="<token créé sur figma.com/settings → Personal access tokens>"

# Google Chat via Zapier MCP bridge (V1)
export ZAPIER_MCP_URL="<URL du serveur MCP Zapier fournie par l'ops>"
export ZAPIER_MCP_API_KEY="<clé API Zapier MCP>"
```

Ajoutez-les à `~/.zshrc` ou `~/.bashrc` pour les garder entre les 5 ateliers.

### Étape 3 — Ouvrir Cursor sur le projet

```bash
cursor .
```

Les rules, les modes et la config MCP sont automatiquement chargés par Cursor
depuis `.cursor/`.

### Étape 4 — Rejoindre le Cursor Team

`Settings → Team → Join « AI SDLC »` (lien d'invitation dans Google Chat
`#aisdlc-ops`). Les rules y seront aussi publiées en « Team Rules » pour les
participants qui ne veulent pas gérer leur copie locale.

### Étape 5 — Lancer le smoke-test

Dans Composer : sélectionner le mode **`aisdlc.team.base`** (ou n'importe
quel mode d'atelier) et exécuter la commande suivante :

```
Smoke-test MCP : lis AISDLC-123 (Jira), lis le fichier figma_key=fig_AISDLC_DS_main (Figma),
liste les branches de `aisdlc-sandbox` (GitHub), et lis le dernier message de `#aisdlc-feedback` (Chat).
Sortie attendue : un bloc markdown OK / ✗ par serveur MCP.
```

Si tout est vert, vous êtes prêt pour J1.

---

## 2. Pré-requis Cursor

- **Cursor ≥ 1.8** (Composer, Custom Modes, MCP stables). `Cursor → Check for Updates`.
- Extensions recommandées : *GitLens*, *Markdown All in One*, *YAML* (Red Hat),
  *Mermaid Preview*.
- Une machine avec **Node ≥ 20** et **pnpm ≥ 9** (nécessaire au squad Code et
  à `install.sh`).
- Compte **Cursor Team** actif (sans droits admin nécessaires).

### Droits applicatifs nécessaires (une fois par participant)

| Outil | Droit minimal |
|---|---|
| Jira project `AISDLC` | `Browse + Create + Edit` |
| Confluence space `AISDLC` | `Add + Edit` |
| GitHub repo `aisdlc-sandbox` | `Write`, création de branches autorisée, push sur `main` interdit |
| Figma team `AI SDLC` | `Can edit` (`Can view` suffit pour Discover/Specify/Quality/Code) |
| Google Chat spaces `#aisdlc-*` | membre |

---

## 3. MCP à activer

Le fichier `.cursor/mcp.json` du kit préconfigure 4 serveurs. Chaque serveur
expose un sous-ensemble explicite d'outils, documenté dans les modes :

### 3.1 Atlassian (Jira + Confluence)

- Package : `@atlassian/mcp-server-atlassian`.
- Auth : `ATLASSIAN_EMAIL` + `ATLASSIAN_API_TOKEN` (créé sur
  <https://id.atlassian.com/manage-profile/security/api-tokens>).
- Portée : project Jira `AISDLC`, space Confluence `AISDLC`.
- Outils utilisés : `search_issues`, `get_issue`, `create_issue`,
  `update_issue`, `add_issue_link`, `add_issue_comment`, `add_labels`,
  `transition_issue`, `get_confluence_page`, `create_confluence_page`.

### 3.2 GitHub

- Package : `@modelcontextprotocol/server-github`.
- Auth : `GITHUB_TOKEN` (Classic PAT, scope `repo` + `read:org`).
- Portée : `aisdlc-sandbox` (branch protection sur `main` côté GitHub).
- Outils utilisés : `search_code`, `get_file_contents`, `get_git_tree`,
  `create_branch`, `create_or_update_file`, `create_pull_request`,
  `update_pull_request`, `request_reviewers`, `get_checks`,
  `get_pull_request`.

### 3.3 Figma

- Package : `@figma/mcp-server-figma`.
- Auth : `FIGMA_API_TOKEN` (<https://www.figma.com/settings> → Personal access
  tokens, scopes `files:read` + `files:write` + `library:read`).
- Portée : team `AI SDLC`, fichier d'écriture `AISDLC — Prototypes`,
  bibliothèque lecture seule `AI SDLC DS`.
- Outils utilisés : `get_file`, `get_metadata`, `create_frame`,
  `create_component_instance`, `set_node_properties`, `set_node_description`,
  `create_prototype_connection`, `get_share_link`.

### 3.4 Google Chat (via Zapier MCP bridge — V1)

- Package : `@zapier/mcp-bridge`.
- Auth : `ZAPIER_MCP_URL` + `ZAPIER_MCP_API_KEY` (créés par l'ops ; voir le
  message épinglé de `#aisdlc-ops`).
- Portée : lecture `#aisdlc-feedback`, `#aisdlc-feedback-demo`, écriture
  `#aisdlc-standup`.
- Outils utilisés : `list_spaces`, `list_messages`, `post_message`.
- Pourquoi un bridge ? Pas de MCP first-party Google Chat mûr à date. À
  remplacer par un connecteur Workspace officiel dès qu'il est disponible
  (voir [§8 Dette V1](#8-dette-v1)).

Tous les secrets sont **lus depuis l'environnement**, jamais commités. Le
kit ne contient aucun secret en clair.

---

## 4. Comment référencer les rules et les modes

### 4.1 Nommage

Convention `aisdlc.<scope>.<name>` partagée entre rules et modes :

- `scope` ∈ { `team`, `discover`, `specify`, `prototype`, `quality`, `code` }
- `name` ∈ kebab-case, 1 à 3 mots

Exemples :

- Rule team : `.cursor/rules/aisdlc.team.base.mdc` → `alwaysApply: true`.
- Rule agent : `.cursor/rules/aisdlc.discover.signal-hunter.mdc` → chargée par
  le mode éponyme.
- Mode agent : `.cursor/modes/aisdlc.discover.signal-hunter.json` → référence
  explicitement ses 2 rules (`aisdlc.team.base` + `aisdlc.discover.signal-hunter`).

### 4.2 Sélectionner un agent dans Composer

1. Ouvrir Composer (`Cmd/Ctrl + L`).
2. En haut à droite, cliquer sur le sélecteur de mode → choisir
   `aisdlc.<scope>.<name>`.
3. La rule team et la rule agent sont automatiquement appliquées.
4. L'allowlist MCP et shell du mode est active : toute action hors scope est
   refusée.

### 4.3 Partage en équipe (optionnel)

Pour éviter la copie manuelle sur les 20 postes, publier les rules et les
modes au niveau Cursor Team :

- `Settings → Team → Rules → Publish from current workspace` (pour les
  `.mdc`).
- `Settings → Team → Custom Modes → Publish from current workspace` (pour
  les `.json`).

Les 20 participants verront alors les 17 modes `aisdlc.*` dans le sélecteur
sans rien installer de plus — ils auront quand même besoin des variables
d'env MCP.

---

## 5. Conventions d'usage pendant les ateliers

### 5.1 Un seul mode actif à la fois

Chaque agent d'un squad a son propre mode. Il est **tentant** de lancer
« les 3 agents ensemble » — ne pas le faire en V1. On lance un mode, on
attend la sortie, on lance le suivant. Les guides animateur (`ateliers/0N-*/guide-animateur.md`) indiquent les prompts exacts à coller dans l'ordre.

### 5.2 Les fichiers pivots sont l'API

Un atelier n'est « fini » que lorsque son fichier pivot
(`opportunity.yaml` / `user-story.yaml` / `figma.yaml` / `test-plan.yaml`)
valide le schéma `pivots/*.schema.yaml`. Le squad de l'atelier suivant
refuse une entrée invalide.

### 5.3 Checkpoints humains

- **Discover → Specify** : passage de `scored` à `selected_for_specify` est
  manuel (vote de restitution).
- **Specify → Prototype/Quality** : passage à `ready_for_proto_and_qa` quand
  les `open_questions` sont résolues.
- **Code** : le `plan.yaml` doit porter `approved: true` saisi par un
  humain **avant** que l'Implementer n'exécute. L'Implementer **stoppe** en
  cas de test rouge — ne jamais désactiver un test.

### 5.4 Sources toujours citées

Tout livrable final cite ses sources : Jira key, Confluence id, Figma
`node_id`, chemin de fichier, lien de message Chat. Pas de verbatim
inventé, pas de score RICE au doigt.

### 5.5 Branches, commits, PRs

- Branche : `cursor/<story-key>-<slug>-6c26`.
- Un commit = un step du plan ; messages en anglais impératif.
- PR : titre et corps en français, référence Jira obligatoire, checklist
  AC/TC obligatoire, pas de self-approve, pas de merge par l'agent.

---

## 6. Arborescence du kit

```
kit-cursor/
├── README.md                        ← vous êtes ici
├── install.sh                       ← bash install.sh <chemin/projet>
├── .cursor/                         ← copié dans le projet par install.sh
│   ├── rules/                       ← 18 .mdc (1 team + 17 agents)
│   │   ├── aisdlc.team.base.mdc
│   │   ├── aisdlc.discover.signal-hunter.mdc
│   │   ├── aisdlc.discover.insight-synth.mdc
│   │   ├── aisdlc.discover.opportunity-scorer.mdc
│   │   ├── aisdlc.specify.story-shaper.mdc
│   │   ├── aisdlc.specify.context-enricher.mdc
│   │   ├── aisdlc.specify.acceptance-architect.mdc
│   │   ├── aisdlc.specify.jira-scribe.mdc
│   │   ├── aisdlc.prototype.flow-mapper.mdc
│   │   ├── aisdlc.prototype.ux-composer.mdc
│   │   ├── aisdlc.prototype.prototype-weaver.mdc
│   │   ├── aisdlc.quality.ambiguity-hunter.mdc
│   │   ├── aisdlc.quality.test-strategist.mdc
│   │   ├── aisdlc.quality.scenario-writer.mdc
│   │   ├── aisdlc.code.context-loader.mdc
│   │   ├── aisdlc.code.planner.mdc
│   │   ├── aisdlc.code.implementer.mdc
│   │   └── aisdlc.code.reviewer.mdc
│   ├── modes/                       ← 17 .json (un par agent)
│   │   └── aisdlc.<scope>.<name>.json
│   └── mcp.json                     ← config MCP (Atlassian, GitHub, Figma, Google Chat/Zapier)
├── pivots/                          ← 4 schémas JSON Schema (YAML)
│   ├── opportunity.schema.yaml
│   ├── user-story.schema.yaml
│   ├── figma.schema.yaml
│   └── test-plan.schema.yaml
├── examples/                        ← cas fictif cohérent qui traverse les 5 ateliers
│   ├── opportunity.yaml             ← checkout-mobile-abandon
│   ├── user-story.yaml              ← AISDLC-456 (fallback saisie manuelle)
│   ├── figma.yaml                   ← flows happy + fallback cliquables
│   └── test-plan.yaml               ← 7 scénarios, coverage 100 % des AC

Les guides animateur ne sont pas dans ce dossier : ils sont avec chaque atelier,
dans `../ateliers/0N-<nom>/guide-animateur.md`.
```

---

## 7. Vérifier que tout marche (smoke-test)

Après installation + export des variables d'env, le participant lance dans
Composer (n'importe quel mode `aisdlc.*`) :

```
Smoke-test AI SDLC :
1. Jira : search_issues JQL "project = AISDLC AND type = Opportunity" (lire 1 issue, imprimer sa key).
2. Confluence : get_page du space AISDLC, titre "AISDLC/raw" (imprimer les 3 premières lignes).
3. GitHub : get_git_tree sur aisdlc-sandbox branche main (imprimer les 5 premières entrées).
4. Figma : get_file file_key=fig_AISDLC_DS_main (imprimer le `name` et le `version`).
5. Google Chat : list_messages space=#aisdlc-feedback-demo limit=1 (imprimer le dernier auteur).
Sortie attendue : un tableau markdown | serveur | status (OK/✗) | détail |.
```

Si un des 4 serveurs répond `✗`, se reporter à `§3 MCP à activer` et au
troubleshooting du catalogue (`reference/catalogue-agents-plugins.md` §11.2).

---

## 8. Alignement Specify → Prototype (nov 2026)

Décision Vivien / Yassine :

- Specify **ne produit pas** de YAML : les stories vivent dans **Jira AS2**.
- Labels : `prete` = `ready_for_proto_and_qa`, `brouillon` = `drafted`.
- Filtre : `reporter = currentUser()` (plus de `participant-pXX`).
- JQL : `project = AS2 AND reporter = currentUser() AND labels = prete`.
- Clés live `AS2-*` (schéma : `^(AS2|AISDLC)-[0-9]+$`).
- AC-N non plafonnés ; `effort_estimate_days` optionnel.
- Flow Mapper : Jira → cache local `docs/prototype/<key>/user-story.yaml`.
- Critère epic + indicateur de succès = sidecar hors pivot.

Voir aussi [`guide-animateur.md`](../ateliers/03-prototype/guide-animateur.md) et le [pack Prototype](../ateliers/03-prototype/pack-prototype/README.md).

---

## 9. Dette V1

Points de friction connus, à adresser après le cycle V1 :

- **`install.sh` non exécutable** : exécuter via `bash install.sh` et non
  `./install.sh`.
- **Google Chat MCP** : bridge Zapier en V1 — à remplacer par un connecteur
  Workspace officiel dès qu'il est publié.
- **Catalogue §4.2 mentionnait un mode `aisdlc.discover.squad` unique** ;
  l'implémentation éclate en **1 mode par agent** pour une allowlist MCP
  plus fine. Le catalogue sera aligné en V2.
- **Catalogue §4.4 suggérait Confluence en `kind` d'evidence** : le schéma
  `opportunity.schema.yaml` l'exige explicitement via `source_id` (format
  libre) mais `kind` reste cantonné à 5 valeurs. Les notes d'interview
  Confluence sont classées en `kind: interview` avec `source_id =
  confluence-id`. Alignement rédactionnel à faire en V2.
- **Xray Test Management** : les modes Quality l'utilisent si présent ;
  fallback type d'issue `Test Case` sinon. Décider en V2 lequel on garde
  pour toute l'orga.
- **Modèles IA codés en dur dans les modes** : les slugs
  (`claude-sonnet-5-5-high`, `claude-opus-5-5-high`) doivent correspondre
  aux modèles réellement disponibles dans votre Cursor Team. S'ils ne le
  sont pas, Cursor propose un fallback interactif ; aligner en V2 une
  variable `@team-default-reasoning` pour éviter de toucher 17 fichiers.
- **CI `pnpm` par défaut** : le squad Code suppose un monorepo pnpm sur
  `aisdlc-sandbox`. Si le repo bascule vers npm/yarn/bun, mettre à jour la
  `shell_allowlist` des modes Code.
