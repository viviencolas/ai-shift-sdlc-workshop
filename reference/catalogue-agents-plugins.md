# Catalogue des agents et plugins — Cycle AI SDLC

> Cycle de 5 ateliers hands-on, lundi → vendredi, 17 h – 19 h, ~20 participants
> (Product / Design / Tech / Delivery).
> Chaque atelier monte un **squad de 2 à 4 agents Cursor** construits comme des
> **configs Composer partagées** (rules + custom modes + MCP).
> Document destiné à un facilitateur qui n'a pas participé à la conception.

---

## Table des matières

1. [Vue d'ensemble du cycle](#1-vue-densemble-du-cycle)
2. [Pipeline et flux de livrables](#2-pipeline-et-flux-de-livrables)
3. [Kit Cursor commun (à installer avant J1)](#3-kit-cursor-commun-à-installer-avant-j1)
4. [Atelier 1 — Discover (Ilyasse EL KHAIRA)](#4-atelier-1--discover)
5. [Atelier 2 — Specify (Vivien COLAS)](#5-atelier-2--specify)
6. [Atelier 3 — Prototype (Yassine AQEJJAJ)](#6-atelier-3--prototype)
7. [Atelier 4 — Quality (Ismael TRAORE)](#7-atelier-4--quality)
8. [Atelier 5 — Code (Patrick BLOT)](#8-atelier-5--code)
9. [Contrats d'interface pivot entre agents](#9-contrats-dinterface-pivot-entre-agents)
10. [Convention de nommage des configs Composer](#10-convention-de-nommage-des-configs-composer)
11. [Annexes](#11-annexes)

---

## 1. Vue d'ensemble du cycle

| Jour | Atelier | Lead | Durée | Squad | Finalité |
|---|---|---|---|---|---|
| Lundi | **Discover** | Ilyasse EL KHAIRA | 2 h | 3 agents | Opportunités priorisées par la valeur |
| Mardi | **Specify** | Vivien COLAS | 2 h | 4 agents | User stories « agent-ready » |
| Mercredi | **Prototype** | Yassine AQEJJAJ | 2 h | 3 agents | Design + prototype cliquable (Figma) |
| Jeudi | **Quality** | Ismael TRAORE | 2 h | 3 agents | US désambiguïsées + plan de test |
| Vendredi | **Code** | Patrick BLOT | 2 h | 4 agents | PR verte livrée par harnais agent |

**Principe pédagogique.** Chaque atelier produit des artefacts réels, archivés
dans un Project store partagé et dans Jira / Figma / GitHub, de sorte que le
squad du jour suivant puisse les consommer sans retraitement.

**Fork du pipeline.** Prototype (mer.) et Quality (jeu.) consomment la même
sortie Specify (mar.) et tournent **en parallèle** du point de vue produit.
Code (ven.) consomme les deux livrables en bout de chaîne.

---

## 2. Pipeline et flux de livrables

```
             ┌─────────────────┐
             │  Discover (J1)  │  → opportunity.yaml  (fichier + ticket Jira « Opportunity »)
             └────────┬────────┘
                      │
                      ▼
             ┌─────────────────┐
             │  Specify (J2)   │  → user-story.yaml  (tickets Jira « Story » + pages de contexte)
             └────────┬────────┘
            ┌─────────┴─────────┐
            ▼                   ▼
   ┌──────────────┐     ┌──────────────┐
   │ Prototype(J3)│     │  Quality(J4) │
   │  → figma.yaml│     │ → test-plan  │
   │   (Figma +   │     │  .yaml       │
   │   lien proto)│     │ (Jira + Xray/│
   │              │     │  Gherkin)    │
   └──────┬───────┘     └──────┬───────┘
          └──────────┬─────────┘
                     ▼
            ┌────────────────┐
            │   Code (J5)    │  → PR GitHub (branche `cursor/<slug>-<id>`),
            │   feature live │     CI verte, ticket Jira mis à jour
            └────────────────┘
```

Les contrats précis des 4 fichiers pivots (`opportunity.yaml`,
`user-story.yaml`, `figma.yaml`, `test-plan.yaml`) sont décrits en
[§9](#9-contrats-dinterface-pivot-entre-agents).

---

## 3. Kit Cursor commun (à installer avant J1)

### 3.1 Version & extensions

- **Cursor ≥ 1.8** (Composer + Custom Modes + MCP stables).
- Extensions : *GitLens*, *Markdown All in One*, *YAML* (RedHat), *Mermaid Preview*.
- Compte **Cursor Team** actif (pour partager rules + custom modes + MCP via
  l'onglet « Team » des settings).

### 3.2 MCP pré-configurés (serveurs partagés niveau équipe)

| MCP | Portée | Pourquoi |
|---|---|---|
| **Atlassian** (Jira + Confluence) | Project + Space dédiés `AISDLC` | Opportunités, Stories, Test plans |
| **GitHub** (`cursor-github`) | Repo `aisdlc-sandbox` | Branches, PR, revues |
| **Figma** | Team Figma `AI SDLC` | Design, prototypage, Code Connect |
| **Google Chat** (via connecteur MCP officiel Google Workspace *ou*, à défaut, bridge Zapier/Pipedream exposé en MCP) | Spaces `#aisdlc-feedback`, `#aisdlc-standup` | Lire les verbatims clients, publier les restitutions |

**Décision V1.** Google Chat n'a pas de MCP first-party mûr à date : on
retient un **bridge Zapier MCP** côté serveur, autorisé en lecture sur
`#aisdlc-feedback` et en écriture sur `#aisdlc-standup`. Si l'organisation
dispose déjà d'un connecteur Workspace interne, on le préfère.

### 3.3 Règles d'équipe partagées (dossier `.cursor/rules/` pushé sur tous les repos de l'atelier)

- `aisdlc.team.base.mdc` : ton, langue (FR), citations obligatoires des
  sources (Jira key, Figma node-id, URL Google Chat), refus silencieux hors
  périmètre `AISDLC`.
- `aisdlc.team.security.mdc` : interdiction d'exposer un secret, pas d'appel
  réseau hors MCP autorisés, pas de push sur `main`.
- `aisdlc.team.outputs.mdc` : tout livrable final doit être un fichier
  `*.yaml` conforme aux schémas §9, **plus** sa publication dans l'outil
  cible (Jira / Figma / GitHub).

### 3.4 Procédure d'installation en 5 minutes (checklist participant)

1. Mettre Cursor à jour (`Cursor → Check for Updates`).
2. Rejoindre le team Cursor **AI SDLC** (lien Chat `#aisdlc-ops`).
3. `Settings → MCP → Enable team MCP` et activer les 4 serveurs listés §3.2.
4. `Settings → Rules → Team rules` : vérifier que les 3 règles `aisdlc.team.*`
   apparaissent et sont actives.
5. Cloner le repo *starter* : `gh repo clone <org>/aisdlc-sandbox && cd aisdlc-sandbox && cursor .`.
   Le repo contient `.cursor/modes/` et `.cursor/rules/` pré-remplis.
6. Lancer `Composer → Custom Modes → aisdlc.team.smoke-test` : le mode
   enchaîne un read Jira + un read Figma + un read GitHub et imprime OK.
   Si un `✗` apparaît, c'est un droit MCP manquant — ping `#aisdlc-ops`.

### 3.5 Pré-requis « comptes & droits » (un seul tableau pour tout le cycle)

| Outil | Droit minimal | Qui en a besoin |
|---|---|---|
| Jira Project `AISDLC` | `Browse + Create + Edit` | tous |
| Confluence Space `AISDLC` | `Add + Edit` | Discover, Specify, Quality |
| GitHub repo `aisdlc-sandbox` | `Write` + `Create branch` (pas `main`) | Code, Specify (lecture seule ok) |
| Figma team `AI SDLC` | `Can edit` | Prototype ; `Can view` pour les autres |
| Google Chat spaces `#aisdlc-*` | membre | tous |
| Cursor Team « AI SDLC » | `Member` (pas `Admin` nécessaire) | tous |

---

## 4. Atelier 1 — Discover

> **Lead :** Ilyasse EL KHAIRA
> **Thème :** Du feedback client aux opportunités priorisées par la valeur.
> **Entrée :** feedback brut (Google Chat `#aisdlc-feedback`, tickets Jira
> « Support », notes d'interviews déposées dans Confluence Space `AISDLC/raw`).
> **Sortie :** `opportunity.yaml` par opportunité (fichier dans le store
> partagé) + ticket Jira « Opportunity » correspondant, priorisés.

### 4.1 Squad d'agents

| # | Nom | Rôle | Articulation |
|---|---|---|---|
| 1 | **Signal Hunter** | Agrège et dédoublonne les feedbacks bruts depuis Google Chat + Jira Support + notes Confluence. | Alimente Insight Synth avec un corpus propre et sourcé. |
| 2 | **Insight Synth** | Cluster thématique, extraction de verbatims, identification des pains et des jobs-to-be-done. | Reçoit du Signal Hunter, pousse des clusters à l'Opportunity Scorer. |
| 3 | **Opportunity Scorer** | Formalise chaque cluster en « opportunité » (schéma §9.1), score RICE et publie dans Jira. | Dernier maillon ; produit les fichiers `opportunity.yaml` que Specify consommera. |

*Pourquoi 3 et pas 4 ?* Un 4ᵉ agent « publier dans Chat » a été écarté : la
publication finale est un click humain en restitution, pour responsabiliser
le squad et éviter un bruit automatisé dans `#aisdlc-standup`.

### 4.2 Custom mode Cursor

- **Nom :** `aisdlc.discover.squad`
- **Modèle recommandé :** Claude Sonnet (bon ratio synthèse / coût ; bascule
  Opus pour la session finale de scoring si le corpus dépasse 500 verbatims).
- **Tools activés :** `read` MCP Atlassian, `read` MCP Google Chat,
  `write` MCP Atlassian (Jira + Confluence), `edit_file` limité à
  `docs/discover/**`, `run_command` désactivé.
- **Scope autorisé :** lecture de tout Jira Project `AISDLC`, écriture limitée
  aux issues de type `Opportunity` et aux pages Confluence `AISDLC/opportunities/*`.

### 4.3 Rules principales (`aisdlc.discover.squad.rules.mdc`, ~12 lignes)

```md
Tu es un agent du squad Discover (AI SDLC).
Ton rôle : transformer du feedback brut en opportunités priorisées, sourcées.
Entrée : verbatims (JSON `{source, author, date, text}`) ou threads Chat/Jira.
Sortie : exclusivement un bloc YAML conforme à `opportunity.schema.yaml`
(aucun texte libre hors de ce bloc dans les artefacts finaux).
Toute affirmation doit citer au moins une source (`source_id`).
Interdiction de créer un ticket Jira hors du Project `AISDLC`.
Interdiction d'écrire dans `#aisdlc-standup` sans validation humaine explicite.
Si une donnée manque pour calculer un score RICE, laisse le champ `null`
et écris une `open_question` plutôt que d'inventer.
Langue des livrables : français ; verbatims conservés en langue d'origine.
Refuse poliment toute demande hors périmètre Discover.
```

### 4.4 MCP / plugins branchés

| Agent | Jira | GitHub | Google Chat | Figma | Autre |
|---|---|---|---|---|---|
| Signal Hunter | lecture (search issues type=Support) | — | lecture `#aisdlc-feedback` | — | lecture Confluence `AISDLC/raw` |
| Insight Synth | lecture | — | lecture | — | — |
| Opportunity Scorer | **écriture** (create Opportunity) + lecture | — | — | — | écriture Confluence `AISDLC/opportunities` |

### 4.5 Scénario d'usage sur 2 h

| Minutage | Phase | Qui / quoi |
|---|---|---|
| 0:00–0:15 | **Accueil** | Objectif, pipeline, rappel du kit commun (§3), tour de table express des rôles. |
| 0:15–0:35 | **Démo guidée** | Ilyasse lance les 3 agents sur un petit jeu de 20 verbatims préchargés dans `#aisdlc-feedback-demo`. Montre les sources citées. |
| 0:35–1:40 | **Lab** | 4 sous-groupes de 5. Chaque sous-groupe se voit assigner une « verticale » de feedbacks (support, NPS, interviews, chat). Les 3 agents tournent en squad. Objectif : 3 à 5 opportunités scorées par sous-groupe. |
| 1:40–2:00 | **Restitution** | Chaque sous-groupe présente son top 2. Vote collectif (sticker Figjam) pour le top 5 global qui sert d'entrée **imposée** pour Specify J2. |

**Moments-clés des agents :**
- `0:35` → Signal Hunter : montrer la dédup (gagner la confiance sur les sources).
- `1:10` → Insight Synth : rendre visible le cluster → verbatim → pain.
- `1:30` → Opportunity Scorer : exposer le score RICE et ses `open_question`.

### 4.6 Pré-requis participants

- Accès `read` sur Google Chat `#aisdlc-feedback` **et** `#aisdlc-feedback-demo`.
- Droit `Create Issue` sur Jira Project `AISDLC`, type `Opportunity`
  (créé par l'ops avant J1).
- Avoir exécuté le smoke-test `aisdlc.team.smoke-test` (§3.4) avec succès.

---

## 5. Atelier 2 — Specify

> **Lead :** Vivien COLAS
> **Thème :** De l'opportunité aux user stories prêtes pour agents.
> **Entrée :** top 5 `opportunity.yaml` sortis de Discover (fichiers + tickets
> Jira « Opportunity »).
> **Sortie :** `user-story.yaml` par story (schéma §9.2) + tickets Jira
> `Story` liés à leur `Opportunity` parent, prêts à être pris en parallèle
> par Prototype (J3) et Quality (J4).

### 5.1 Squad d'agents

| # | Nom | Rôle | Articulation |
|---|---|---|---|
| 1 | **Story Shaper** | Découpe l'opportunité en epics puis en user stories INVEST (≤ 3 j de dev). | Produit les US brutes consommées par les 3 autres. |
| 2 | **Context Enricher** | Explore le repo `aisdlc-sandbox` pour attacher à chaque US des pointeurs de code (modules, APIs, fichiers Figma existants). | Reçoit la liste de Story Shaper, renvoie une US enrichie. |
| 3 | **Acceptance Architect** | Rédige les critères d'acceptation en **Gherkin minimal** (≤ 5 scénarios / US). | Consomme l'US enrichie, prépare le terrain pour Quality. |
| 4 | **Jira Scribe** | Publie, met à jour, lie à l'`Opportunity` parent, assigne labels et `fixVersion`. | Dernier maillon ; émet `user-story.yaml` final. |

*Pourquoi 4 ?* Le passage « agent-ready » nécessite une étape d'enrichissement
codebase qui échoue si on la fusionne avec le rédacteur Gherkin (modèles et
tools très différents). Split explicite.

### 5.2 Custom mode Cursor

- **Nom :** `aisdlc.specify.squad`
- **Modèle recommandé :** Claude Sonnet (Opus pour Context Enricher si le
  repo dépasse 100k LOC).
- **Tools activés :** lecture Jira + Confluence, lecture GitHub
  (`search_code`, `get_file_contents`), écriture Jira, `edit_file` limité à
  `docs/specify/**`, `run_command` désactivé sauf `git log/diff/grep`.
- **Scope :** repo `aisdlc-sandbox` branche `main` en lecture seule, écriture
  Jira sur type `Story` uniquement.

### 5.3 Rules principales (`aisdlc.specify.squad.rules.mdc`)

```md
Tu es un agent du squad Specify (AI SDLC).
Ton rôle : transformer une Opportunity en User Stories « agent-ready ».
Entrée : un `opportunity.yaml` (schéma §9.1) + l'accès GitHub en lecture.
Sortie : un `user-story.yaml` par story (schéma §9.2) + un ticket Jira Story.
Chaque US respecte INVEST, tient en ≤ 3 jours de dev, et porte au moins
un pointeur de code (`code_hints[]`) ou un pointeur Figma (`design_hints[]`).
Chaque critère d'acceptation est rédigé en Gherkin (Given/When/Then), ≤ 5
scénarios par US.
Interdiction d'écrire sur la branche `main` ou d'ouvrir une PR.
Si une info manque, écris une `open_question` sourcée plutôt que d'inventer.
Lien obligatoire vers l'Opportunity parent (champ `parent_jira_key`).
Langue : français pour la narration, anglais technique pour les identifiants.
```

### 5.4 MCP / plugins branchés

| Agent | Jira | GitHub | Google Chat | Figma |
|---|---|---|---|---|
| Story Shaper | lecture Opportunity + écriture Story | — | — | — |
| Context Enricher | lecture Story | **lecture repo** (search_code, get_file_contents) | — | **lecture** (list_files + get_metadata) |
| Acceptance Architect | lecture/écriture Story | lecture (read only sur tests existants) | — | lecture (parcourir les designs déjà en place) |
| Jira Scribe | **écriture** (update, link, label) | — | — | — |

### 5.5 Scénario d'usage sur 2 h

| Minutage | Phase | Contenu |
|---|---|---|
| 0:00–0:10 | **Accueil** | Rappel de la sortie Discover (top 5). Chaque sous-groupe adopte une opportunité. |
| 0:10–0:30 | **Démo** | Vivien lance le squad complet sur une 6ᵉ opportunité préparée. Montre le relais Story Shaper → Context Enricher. |
| 0:30–1:40 | **Lab** | Sous-groupes de 4-5. Objectif : 3 à 6 US par opportunité, toutes publiées en Jira avec parent liées. Les groupes peuvent itérer sur les rules locales via `.cursor/rules/aisdlc.specify.local.mdc`. |
| 1:40–2:00 | **Restitution** | Démo croisée : chaque groupe donne 1 US au groupe voisin, qui joue le rôle de Quality et cherche 1 ambiguïté. Préfigure J4. |

**Moments-clés des agents :**
- `0:20` → Story Shaper : montrer l'extraction INVEST.
- `0:45` → Context Enricher : montrer la découverte de `code_hints[]`.
- `1:15` → Acceptance Architect : montrer la génération Gherkin.
- `1:30` → Jira Scribe : montrer l'écriture Jira + le lien parent.

### 5.6 Pré-requis participants

- Droit `Create / Edit Story` sur Jira Project `AISDLC`.
- `Read` sur GitHub `aisdlc-sandbox` (le mode `specify` n'ouvre pas de PR).
- Avoir consommé la sortie Discover (fichiers `opportunity.yaml` dans
  `docs/discover/` du store partagé).

---

## 6. Atelier 3 — Prototype

> **Lead :** Yassine AQEJJAJ
> **Thème :** Des user stories au design et au prototype cliquable générés
> par des agents.
> **Entrée :** `user-story.yaml` (sortie Specify).
> **Sortie :** `figma.yaml` par flow (schéma §9.3) pointant vers un fichier
> Figma peuplé (frames + composants + prototypage cliquable), + lien
> `prototype_url` posté en commentaire sur le ticket Jira Story.

### 6.1 Squad d'agents

| # | Nom | Rôle | Articulation |
|---|---|---|---|
| 1 | **Flow Mapper** | Lit les US d'une opportunité, en déduit les user flows (étapes, décisions, états d'erreur). | Produit un flow structuré (JSON) consommé par UX Composer. |
| 2 | **UX Composer** | Assemble les écrans dans Figma via MCP (Design + Dev Mode) à partir du design system `AI SDLC DS`. | Convertit chaque étape du flow en frame. |
| 3 | **Prototype Weaver** | Ajoute les interactions cliquables (hotspots, transitions, overlays), génère le lien de partage. | Dernier maillon ; produit `figma.yaml`. |

*Pourquoi 3 et pas 4 ?* Un 4ᵉ agent « revue a11y/consistency » a été
envisagé ; on l'a écarté de la V1 car Quality (J4) tourne en parallèle et
couvre déjà la vérification. On ré-intègrera cet agent en V2 si les
restitutions montrent un besoin.

### 6.2 Custom mode Cursor

- **Nom :** `aisdlc.prototype.squad`
- **Modèle recommandé :** Claude Sonnet (bon rendu structurel) ; GPT-5
  envisageable pour les squads testant des variations UI génératives.
- **Tools activés :** lecture Jira (Story), **écriture Figma** (create frame,
  create component instance, create prototype connection), `edit_file`
  limité à `docs/prototype/**`, `run_command` désactivé.
- **Scope :** Figma team `AI SDLC`, fichier `AISDLC — Prototypes` ;
  interdiction d'éditer la bibliothèque `AI SDLC DS` (lecture seule).

### 6.3 Rules principales (`aisdlc.prototype.squad.rules.mdc`)

```md
Tu es un agent du squad Prototype (AI SDLC).
Ton rôle : transformer des user stories en prototype Figma cliquable.
Entrée : liste de `user-story.yaml` (schéma §9.2).
Sortie : un `figma.yaml` par flow (schéma §9.3) + un fichier Figma à jour.
Utilise exclusivement les composants de la bibliothèque `AI SDLC DS`.
Interdiction de créer un composant from scratch : si un besoin manque,
émets une `open_question` et stoppe ce flow.
Chaque frame doit porter en description son `story_key` Jira source.
Les transitions prototypes sont `On tap → Navigate To`, durée 150 ms,
pas d'animations personnalisées en V1.
Publie le lien de partage (view-only) en commentaire sur le ticket Story.
Interdiction de supprimer des pages Figma existantes.
Langue des libellés UI : français, verbatims produit respectés.
```

### 6.4 MCP / plugins branchés

| Agent | Jira | GitHub | Google Chat | Figma |
|---|---|---|---|---|
| Flow Mapper | lecture Story | — | — | lecture (bibliothèque DS) |
| UX Composer | lecture Story | — | — | **écriture** (frames + instances) |
| Prototype Weaver | **écriture commentaire** Story | — | — | **écriture** (prototype connections + share link) |

### 6.5 Scénario d'usage sur 2 h

| Minutage | Phase | Contenu |
|---|---|---|
| 0:00–0:10 | **Accueil** | Rappel pipeline : Prototype et Quality consomment la **même** entrée Specify, pas de dépendance entre les deux. |
| 0:10–0:35 | **Démo** | Yassine joue le squad complet sur 1 US. Montre la découverte DS → frame → interaction → lien partagé. |
| 0:35–1:40 | **Lab** | Sous-groupes de 4-5. Chaque groupe prend 2 à 3 US de son opportunité J2 et produit un prototype cliquable. |
| 1:40–2:00 | **Restitution** | Démo croisée : chaque sous-groupe teste le prototype d'un autre et laisse 1 feedback en commentaire Figma. |

**Moments-clés des agents :**
- `0:15` → Flow Mapper : rendre visible le passage US → flow (diagramme).
- `0:25` → UX Composer : montrer l'appel MCP Figma qui crée une frame.
- `0:32` → Prototype Weaver : partager le lien et le commenter dans Jira.

### 6.6 Pré-requis participants

- Rôle `Can edit` sur la team Figma `AI SDLC`.
- Bibliothèque `AI SDLC DS` publiée et accessible (vérifié par l'ops avant J3).
- Lecture Jira Project `AISDLC`.
- Avoir une Story J2 assignée au sous-groupe (l'ops attribue en début de séance).

---

## 7. Atelier 4 — Quality

> **Lead :** Ismael TRAORE
> **Thème :** Des user stories sans ambiguïté, avec leur plan de test.
> **Entrée :** `user-story.yaml` (sortie Specify) — **même** entrée que
> Prototype.
> **Sortie :** `test-plan.yaml` par US (schéma §9.4) + versions des Stories
> Jira mises à jour (critères d'acceptation reformulés, ambiguïtés résolues).

### 7.1 Squad d'agents

| # | Nom | Rôle | Articulation |
|---|---|---|---|
| 1 | **Ambiguity Hunter** | Relit chaque US et ses critères Gherkin, détecte les formulations floues, les valeurs manquantes, les contradictions. | Produit une liste `issues[]` à faire adresser. |
| 2 | **Test Strategist** | Décide la stratégie par US : niveau (unit / integration / e2e), manuel vs automatisé, environnements, données. | Consomme la US corrigée et dessine la stratégie. |
| 3 | **Scenario Writer** | Écrit les scénarios Gherkin détaillés **et** les cas limites / edge cases, relie chaque scénario à un `story_key`. | Produit `test-plan.yaml` final + publie dans Jira Xray. |

*Pourquoi 3 ?* Un 4ᵉ « Traceability Keeper » a été envisagé mais sa
fonction est couverte par le champ `coverage[]` de `test-plan.yaml` (§9.4) :
la traçabilité est générée par schéma, pas par agent dédié.

### 7.2 Custom mode Cursor

- **Nom :** `aisdlc.quality.squad`
- **Modèle recommandé :** Claude Sonnet (bon pour le repérage d'ambiguïtés) ;
  Opus pour les US critiques (paiement, RGPD).
- **Tools activés :** lecture/écriture Jira (Stories + Test cases Xray),
  `edit_file` limité à `docs/quality/**`, `run_command` désactivé.
- **Scope :** Jira Project `AISDLC`, types `Story` (édition des AC
  autorisée) et `Test` (Xray, création autorisée).

### 7.3 Rules principales (`aisdlc.quality.squad.rules.mdc`)

```md
Tu es un agent du squad Quality (AI SDLC).
Ton rôle : rendre les US non ambiguës et en produire le plan de test.
Entrée : `user-story.yaml` (schéma §9.2).
Sortie : un `test-plan.yaml` par US (schéma §9.4) + mises à jour Jira.
Toute ambiguïté détectée ouvre une `issue` typée {missing_value,
contradiction, untestable, ambiguous_term} avec citation du passage.
Pour chaque critère d'acceptation, au moins un scénario Gherkin avec
des valeurs concrètes (pas de « un utilisateur ») doit exister.
Les edge cases couvrent au minimum : entrée vide, max/min, accès
non autorisé, concurrence, i18n si l'US touche à du contenu.
Interdiction de modifier une US sans tracer un commentaire Jira
explicatif (`[Quality] reformulation: ...`).
Interdiction d'écrire dans GitHub ou Figma.
Langue : français.
```

### 7.4 MCP / plugins branchés

| Agent | Jira | GitHub | Google Chat | Figma |
|---|---|---|---|---|
| Ambiguity Hunter | lecture Story + **écriture commentaire** | — | — | — |
| Test Strategist | lecture Story | — | — | — |
| Scenario Writer | **écriture** Story (AC) + **écriture Xray Test** | — | — | — |

### 7.5 Scénario d'usage sur 2 h

| Minutage | Phase | Contenu |
|---|---|---|
| 0:00–0:10 | **Accueil** | Rappel parallèle avec Prototype. Objectif : revenir en J5 avec des US qui ne plantent pas l'agent dev. |
| 0:10–0:30 | **Démo** | Ismael joue le squad sur 1 US volontairement floue. Montre les 3 types d'ambiguïtés détectées. |
| 0:30–1:40 | **Lab** | Sous-groupes de 4-5. Chaque groupe prend les mêmes US que son clone Prototype (volontairement, pour comparer en fin de séance). Produit `test-plan.yaml` et met à jour Jira. |
| 1:40–2:00 | **Restitution** | Chaque sous-groupe partage **une** ambiguïté remarquable détectée et la reformulation adoptée. Les reformulations sont reportées sur les US pour J5. |

**Moments-clés des agents :**
- `0:20` → Ambiguity Hunter : afficher la liste des ambiguïtés (démo frappante).
- `0:40` → Test Strategist : montrer la décision auto vs manuel.
- `1:20` → Scenario Writer : montrer un scénario edge case généré.

### 7.6 Pré-requis participants

- Droit `Create Test (Xray)` sur Jira Project `AISDLC` (si Xray indisponible,
  fallback : type d'issue custom `Test Case` — à vérifier par l'ops).
- Lecture Confluence `AISDLC/opportunities`.
- Avoir consommé la sortie Specify (fichiers `user-story.yaml`).

---

## 8. Atelier 5 — Code

> **Lead :** Patrick BLOT
> **Thème :** De la user story à la fonctionnalité livrée par un harnais
> agent sous contrôle.
> **Entrée :** `user-story.yaml` (Specify) + `figma.yaml` (Prototype) +
> `test-plan.yaml` (Quality) — bout de chaîne, consomme les trois.
> **Sortie :** une PR GitHub par US sur `aisdlc-sandbox` (branche
> `cursor/<story-key>-<slug>-6c26`), CI verte, ticket Jira Story passé en
> `In Review`.

### 8.1 Squad d'agents

| # | Nom | Rôle | Articulation |
|---|---|---|---|
| 1 | **Context Loader** | Rassemble US + plan de test + lien Figma + fichiers de code pointés par `code_hints[]`. | Prépare un « briefing pack » utilisé par Planner et Implementer. |
| 2 | **Planner** | Décompose l'implémentation en 5 à 10 steps (chaque step < 50 lignes diff), identifie les fichiers à toucher. | Produit un plan validé en 1 tour humain avant exécution. |
| 3 | **Implementer** | Exécute le plan step by step : édition, run tests locaux, commits par step. | Contrainte : un step = un commit atomique ; stop si un test cassé. |
| 4 | **Reviewer** | Relit la PR contre les critères d'acceptation et le plan de test ; propose des changements avant d'autoriser le `ready_for_review`. | Dernier maillon ; ouvre la PR, relie la Story Jira, poste le résumé sur `#aisdlc-standup`. |

*Pourquoi 4 ?* Le harnais « sous contrôle » impose un split clair
planification / exécution / revue pour que l'humain facilitateur puisse
intervenir à des points précis.

### 8.2 Custom mode Cursor

- **Nom :** `aisdlc.code.squad`
- **Modèle recommandé :** Claude Sonnet pour Context Loader et Planner ;
  Claude Opus (ou GPT-5) pour Implementer et Reviewer (qualité de code).
- **Tools activés :** lecture Jira + Figma, **écriture GitHub**
  (`create_branch`, `commit`, `open_pr`, `request_review`), `edit_file`
  plein pouvoir sur le repo `aisdlc-sandbox`, `run_command` **activé** pour
  les commandes allowlist `pnpm test`, `pnpm lint`, `pnpm build`,
  `git status`, `git diff`, `git log`.
- **Scope :** repo `aisdlc-sandbox` **uniquement**, branche
  `cursor/*-6c26` **uniquement**. Interdiction d'écrire sur `main` ou toute
  autre branche. Interdiction de pousser des secrets (hook pre-commit
  `trufflehog` fourni par l'ops).

### 8.3 Rules principales (`aisdlc.code.squad.rules.mdc`)

```md
Tu es un agent du squad Code (AI SDLC).
Ton rôle : livrer une PR qui satisfait une US, son test-plan et son proto.
Entrée : `user-story.yaml`, `test-plan.yaml`, `figma.yaml` (schémas §9).
Sortie : une PR sur `aisdlc-sandbox`, branche `cursor/<story-key>-<slug>-6c26`.
Un commit = un step du plan ; chaque commit passe `pnpm lint && pnpm test`.
Si un test rouge apparaît, stoppe, documente et demande validation humaine ;
n'essaie pas de masquer ou désactiver un test existant.
Aucune écriture hors du repo `aisdlc-sandbox` ; aucune écriture sur `main`.
Avant d'ouvrir la PR, vérifie que chaque critère d'acceptation (Gherkin)
est couvert par un test automatisé ou noté manuel dans la PR.
Le corps de PR inclut : lien Jira Story, lien Figma, résumé des steps,
checklist `test-plan.yaml`.
Langue : français pour le corps de PR, anglais pour le code et les commits.
```

### 8.4 MCP / plugins branchés

| Agent | Jira | GitHub | Google Chat | Figma |
|---|---|---|---|---|
| Context Loader | lecture Story + Tests | **lecture** repo (code_hints) | — | **lecture** fichiers Figma (`figma.yaml.file_key`) |
| Planner | lecture Story | lecture repo | — | lecture Figma (références visuelles) |
| Implementer | — | **écriture** (branch + commit) | — | — |
| Reviewer | **écriture** (transition Story → In Review) | **écriture** (open PR, request review) | **écriture** `#aisdlc-standup` (résumé livraison) | — |

### 8.5 Scénario d'usage sur 2 h

| Minutage | Phase | Contenu |
|---|---|---|
| 0:00–0:10 | **Accueil** | Rappel du contrat : le Code consomme Specify + Prototype + Quality. Un seul objectif : PR verte par sous-groupe. |
| 0:10–0:40 | **Démo** | Patrick joue le squad sur une US simple préparée. Montre la **validation humaine** du plan (checkpoint Planner), puis l'exécution step by step. Insiste sur l'arrêt automatique sur test rouge. |
| 0:40–1:50 | **Lab** | Sous-groupes de 4-5. Chaque groupe pousse 1 PR par sous-groupe (viser verte). Checkpoints humains à chaque fin de step. |
| 1:50–2:00 | **Restitution** | Chaque groupe montre sa PR, son CI et le message auto-publié dans `#aisdlc-standup`. |

**Moments-clés des agents :**
- `0:15` → Context Loader : montrer le briefing pack (rassure sur le socle).
- `0:25` → Planner : point de validation humaine n° 1 (décision explicite).
- `0:35` → Implementer : premier commit auto, test vert.
- `1:45` → Reviewer : ouverture de PR + transition Jira + post Chat.

### 8.6 Pré-requis participants

- Droit `Write` sur `aisdlc-sandbox`, `Create branch` autorisé, **push sur
  `main` refusé** par règle de protection (vérifié par l'ops).
- Node ≥ 20, `pnpm` ≥ 9 installés localement.
- Pre-commit hook `trufflehog` activé (installeur dans `aisdlc-sandbox/scripts/setup.sh`).
- Avoir consommé Specify (US), Prototype (figma.yaml) et Quality (test-plan.yaml)
  pour la ou les Story du sous-groupe.

---

## 9. Contrats d'interface pivot entre agents

Les 4 schémas ci-dessous **sont** l'API du pipeline. Un livrable qui ne
valide pas son schéma ne passe pas à l'atelier suivant. Validation :
`yaml-schema-validator` fourni dans `aisdlc-sandbox/scripts/validate.ts`.

### 9.1 `opportunity.schema.yaml` — sortie Discover → entrée Specify

```yaml
opportunity:
  id: string                  # slug, ex: "checkout-mobile-abandon"
  title: string               # ≤ 80 car
  parent_jira_key: string     # ex: "AISDLC-123"
  problem: string             # 2-5 phrases, sourcé
  target_user: string         # persona ou segment
  evidence:
    - source_id: string       # jira-key | chat-url | confluence-id | interview-id
      kind: enum[support_ticket, chat_verbatim, interview, nps, analytics]
      excerpt: string         # verbatim brut
      date: date
  pains:
    - string                  # pain déclaré, 1 par ligne
  jobs_to_be_done:
    - string
  rice:
    reach: number | null
    impact: enum[0.25, 0.5, 1, 2, 3] | null
    confidence: number | null  # 0-1
    effort_days: number | null
    score: number | null       # auto-calculé
  open_questions:
    - string
  owner: string                # lead de l'opportunity
  status: enum[discovered, scored, selected_for_specify]
```

### 9.2 `user-story.schema.yaml` — sortie Specify → entrée Prototype et Quality

```yaml
user_story:
  key: string                 # jira key, ex: "AISDLC-456"
  parent_opportunity: string  # id opportunity (voir 9.1)
  as_a: string
  i_want: string
  so_that: string
  acceptance_criteria:        # Gherkin minimal
    - id: string              # ex: "AC-1"
      given: string
      when: string
      then: string
  code_hints:                 # pointeurs vers le repo
    - repo: string            # ex: "aisdlc-sandbox"
      path: string            # ex: "apps/web/src/checkout/**"
      note: string
  design_hints:               # pointeurs vers Figma existant
    - file_key: string
      node_id: string
      note: string
  non_functional:
    - string                  # perf, a11y, i18n, sécurité
  effort_estimate_days: number
  open_questions:
    - string
  status: enum[drafted, enriched, ready_for_proto_and_qa]
```

### 9.3 `figma.schema.yaml` — sortie Prototype → entrée Code

```yaml
figma:
  story_key: string           # user_story.key associé
  file_key: string
  prototype_url: string       # lien de partage view-only
  flows:
    - id: string
      entry_node_id: string
      steps:
        - node_id: string
          name: string
          interactions:
            - trigger: enum[on_tap, on_hover, on_drag]
              action: enum[navigate_to, open_overlay, close_overlay]
              target_node_id: string
      covers_acceptance_criteria:
        - string              # ex: "AC-1"
  design_system_version: string
  open_questions:
    - string
  status: enum[in_progress, ready_for_code]
```

### 9.4 `test-plan.schema.yaml` — sortie Quality → entrée Code

```yaml
test_plan:
  story_key: string
  strategy:
    levels:                   # ≥ 1
      - enum[unit, integration, e2e, manual_exploratory]
    automation_target: enum[full, partial, manual_only]
    environments:
      - enum[dev, staging, prod_like]
    data_requirements:
      - string
  scenarios:
    - id: string              # "TC-1"
      given: string
      when: string
      then: string
      type: enum[happy_path, edge_case, negative, non_functional]
      covers_acceptance_criteria:
        - string              # ex: "AC-1"
      automated: boolean
  coverage:                   # traçabilité
    - acceptance_criterion_id: string
      scenario_ids:
        - string
  issues_found_in_story:      # ambiguïtés remontées à Specify
    - type: enum[missing_value, contradiction, untestable, ambiguous_term]
      excerpt: string
      proposed_fix: string
  status: enum[drafted, ambiguities_raised, ready_for_code]
```

**Règle de chaînage.** Un livrable n'est consommable que si son `status`
est `ready_for_<next_step>` **et** si son fichier YAML valide le schéma.
Les sous-groupes ne passent pas à l'atelier suivant tant que leurs fichiers
pivots ne sont pas verts.

---

## 10. Convention de nommage des configs Composer

Les 20 participants partagent les mêmes configs ; la lisibilité des noms
est non-négociable.

### 10.1 Rules partagées

Fichier Markdown Cursor (`.mdc`), dans `.cursor/rules/`.

```
aisdlc.<scope>.<name>.mdc
```

- `scope` ∈ { `team`, `discover`, `specify`, `prototype`, `quality`, `code` }
- `name` ∈ `kebab-case`, 1 à 3 mots, descriptif
- Exemples :
  - `aisdlc.team.base.mdc`
  - `aisdlc.team.security.mdc`
  - `aisdlc.discover.squad.mdc`
  - `aisdlc.code.squad.mdc`
  - `aisdlc.prototype.frame-authoring.mdc` (ad hoc par un sous-groupe)

### 10.2 Custom modes Composer

Fichier JSON dans `.cursor/modes/` ou publié au niveau Team.

```
aisdlc.<scope>.<name>
```

- Mêmes règles que les rules.
- Exemples : `aisdlc.discover.squad`, `aisdlc.code.squad`,
  `aisdlc.team.smoke-test`.

### 10.3 Branches Git (cf. instructions Cloud Agents)

```
cursor/<story-key>-<slug>-6c26
```

Ex: `cursor/aisdlc-456-checkout-mobile-nudge-6c26`.

### 10.4 Fichiers pivots dans le store partagé

```
docs/<workshop>/<opportunity-or-story-id>/<kind>.yaml
```

Exemples :
- `docs/discover/checkout-mobile-abandon/opportunity.yaml`
- `docs/specify/aisdlc-456/user-story.yaml`
- `docs/prototype/aisdlc-456/figma.yaml`
- `docs/quality/aisdlc-456/test-plan.yaml`

### 10.5 Labels Jira

- `aisdlc:opportunity`, `aisdlc:story`, `aisdlc:test`
- `aisdlc:workshop-<day>` (ex: `aisdlc:workshop-tue`)
- `aisdlc:squad-<group-id>` (ex: `aisdlc:squad-3`)

---

## 11. Annexes

### 11.1 Rôles jouables côté humain (pour les sous-groupes de 4-5)

| Rôle humain | Mission dans l'atelier |
|---|---|
| **Pilote Cursor** | Tape dans le Composer, lance les agents, exécute les validations humaines. |
| **Scribe** | Note les décisions, pousse les commits, met à jour Jira. |
| **Challenger** | Pose les questions que l'agent devrait se poser, remet en cause les propositions. |
| **Témoin métier** | Garantit la fidélité au contexte produit / utilisateur. |
| **Observateur** (optionnel 5ᵉ) | Prend des notes pour la restitution. |

### 11.2 Troubleshooting express (à imprimer en salle)

| Symptôme | Cause probable | Fix |
|---|---|---|
| L'agent Jira dit « 403 » | MCP Atlassian non autorisé | `Settings → MCP → Atlassian → Reconnect` |
| Figma MCP ne crée pas de frame | Mode « view » actif, besoin de Dev Mode / write | Repasser en `Can edit` sur la team |
| L'agent ne voit pas la Story | Mauvais JQL, Story non labellisée | Vérifier label `aisdlc:story` et `aisdlc:workshop-<day>` |
| Pre-commit bloque un push | trufflehog détecte un secret | Nettoyer, ne pas désactiver le hook |
| Plus d'infos | — | Ping `#aisdlc-ops` |

### 11.3 Ce qui n'est **pas** dans la V1 (dette assumée)

- Pas d'agent dédié à l'a11y/consistency en Prototype (couvert par Quality).
- Pas d'intégration analytique produit (Amplitude/Mixpanel) côté Discover
  (hors stack plugin par défaut ; on consomme ce qui remonte en Chat/Jira).
- Pas d'automatisation de déploiement post-merge en Code (on s'arrête à la
  PR verte ; le déploiement reste manuel pour V1).
- Google Chat MCP : bridge Zapier en V1, à remplacer par un connecteur
  Workspace officiel dès que disponible.

Ces trois choix sont assumés pour tenir les 2 h par atelier et le squad de
2 à 4 agents. À réévaluer après le cycle V1 sur la base des restitutions.
