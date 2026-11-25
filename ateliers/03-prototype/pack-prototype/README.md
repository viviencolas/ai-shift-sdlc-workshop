# Pack Atelier 3 — Prototype (agents téléchargeables)

> Squad de **3 agents Cursor** pour l’atelier Prototype (Yassine AQEJJAJ).
> Contient : **rules**, **custom modes**, **skills**, **MCP**, **schémas pivots**,
> **exemple** et **guide facilitateur**.

## Les 3 agents

| # | Agent | Rôle | Mode | Skill |
|---|---|---|---|---|
| 1 | **Flow Mapper** | Jira AS2 (`prete`) → pivot cache → user flows | `aisdlc.prototype.flow-mapper` | `aisdlc-prototype-flow-mapper` |
| 2 | **UX Composer** | Flow → frames Figma (DS only) | `aisdlc.prototype.ux-composer` | `aisdlc-prototype-ux-composer` |
| 3 | **Prototype Weaver** | Frames → prototype cliquable + `figma.yaml` | `aisdlc.prototype.prototype-weaver` | `aisdlc-prototype-weaver` |

Enchaînement : Flow Mapper → UX Composer → Prototype Weaver.

## Installation (2 min)

### Depuis un clone du dépôt

```bash
# Sur votre Mac, dans le projet cible (ex. ~/AI\ SDLC)
cd ~/AI\ SDLC   # adaptez le chemin

bash <chemin/vers/ai-shift-sdlc-workshop>/ateliers/03-prototype/pack-prototype/install.sh .
```

### Depuis le ZIP téléchargé

```bash
unzip pack-prototype.zip -d ~/Downloads
cd ~/AI\ SDLC
bash ~/Downloads/pack-prototype/install.sh .
```

L’installateur :

1. copie `.cursor/` du pack (rules + modes + mcp.json) dans le projet cible ;
2. copie les 3 skills dans `.cursor/skills/` ;
3. copie `pivots/`, `examples/`, `guide/` sous `aisdlc/prototype/`.

## Variables d’environnement MCP

```bash
export ATLASSIAN_SITE_URL="https://<instance>.atlassian.net"
export ATLASSIAN_EMAIL="<votre@email>"
export ATLASSIAN_API_TOKEN="<token>"
export FIGMA_API_TOKEN="<token Figma>"
```

## Alignement Specify (nov 2026)

- **Pas d’export YAML** en sortie Specify. Entrée live = **Jira projet AS2**.
- Labels : `prete` → `ready_for_proto_and_qa` ; `brouillon` → refusées.
- Filtre : `reporter = currentUser()` (plus de `participant-pXX`). JQL :
  `project = AS2 AND reporter = currentUser() AND labels = prete`
- Epic propre par participant ; **AS2-3** = démo seulement.
- AC-N **non plafonnés** ; `effort_estimate_days` **optionnel** (section Effort retirée).
- Clés live **`AS2-*`** ; schéma accepte aussi `AISDLC-*` pour l’exemple kit.
- Flow Mapper : Jira → cache `docs/prototype/<key>/user-story.yaml` → flow.
- Critère epic / indicateur de succès = sidecar hors pivot.

## Utilisation dans Cursor

1. `cursor .` sur le projet installé.
2. Composer → mode `aisdlc.prototype.flow-mapper`.
3. Lancer Flow Mapper avec la JQL `project = AS2 AND reporter = currentUser() AND labels = prete` — pas de clé d’epic à saisir, pas de YAML Specify.
4. Enchaîner UX Composer puis Prototype Weaver.

Les skills sont aussi disponibles côté Cursor Skills (dossier `.cursor/skills/`)
pour rappel de workflow si vous ne passez pas par un custom mode.

## Contenu du pack

```
pack-prototype/
├── README.md
├── install.sh
├── .cursor/
│   ├── rules/          # team.base + 3 rules Prototype
│   ├── modes/          # 3 custom modes JSON
│   └── mcp.json        # Atlassian + Figma
├── skills/             # 3 skills Cursor (SKILL.md)
│   ├── aisdlc-prototype-flow-mapper/
│   ├── aisdlc-prototype-ux-composer/
│   └── aisdlc-prototype-weaver/
├── pivots/             # user-story + figma schemas
├── examples/           # AISDLC-456 (fallback adresse)
└── guide/              # facilitator-guide.md
```

## Pré-requis atelier

- Cursor ≥ 1.8
- Figma team `AI SDLC` : `Can edit` sur `AISDLC — Prototypes`, lecture `AI SDLC DS`
- Jira projet **AS2** : lecture Story + commentaire (MCP Atlassian)
- US d’entrée : label **`prete`** (équivalent `ready_for_proto_and_qa`)

## Exemple kit vs live

`examples/user-story.yaml` garde la clé démo `AISDLC-456` pour valider le schéma hors session.
En atelier, les clés seront `AS2-*` lues depuis Jira.
