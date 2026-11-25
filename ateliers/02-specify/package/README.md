# Kit Specify pour Cursor · de l'epic Jira aux user stories

Ce kit installe dans Cursor le pipeline « Specify » de l'atelier 2 de
l'Agentic SDLC, prêt à l'emploi, sans avoir suivi l'atelier. Il
transforme une epic Jira en user stories rédigées, relues et publiées
dans Jira sous cette même epic.

Cinq briques, toutes dans `.cursor/` :

```
.cursor/
├── rules/us-redaction.mdc            rule toujours appliquée + PARAMÈTRES JIRA
├── skills/refinement-us/
│   ├── SKILL.md                      skill de refinement (/refinement-us)
│   └── references/                   DoR, DoD, template, grille, deux exemples
│       ├── definition-of-ready.md
│       ├── definition-of-done.md
│       ├── template-user-story.md
│       ├── grille-challenge.md
│       ├── exemple-bonne-us.md
│       └── exemple-mauvaise-us.md
├── agents/
│   ├── us-reviewer.md                relecteur à froid, lecture seule
│   └── jira-story-publisher.md       publieur Jira, modes aperçu et publication
└── commands/publier.md               commande /publier
```

| Brique | Rôle | Dialogue |
|--------|------|----------|
| Rule `us-redaction` | Français, Gherkin en anglais, rien d'inventé ; porte les paramètres Jira. | Aucun : s'applique à chaque chat. |
| Skill `refinement-us` | Lire l'epic, découper, challenger, rédiger, contrôler la DoR, obtenir votre GO. | Oui : vous jouez le product owner (PO). |
| Subagent `us-reviewer` | Relire chaque story contre la DoR sans connaître l'échange. Ne modifie rien. | Non : un message reçu, un verdict rendu. |
| Subagent `jira-story-publisher` | Revérifier, chercher l'existant, créer ou mettre à jour, relire, récapituler. | Non : s'il manque une info, il s'arrête et liste les manques. |
| Commande `/publier` | Lancer un publieur par story du GO, en parallèle. | Sans objet. |

## 1. Prérequis

- **Cursor** récent, avec le mode Agent, les skills, les subagents et
  les commandes (menu `/`).
- **Le MCP Atlassian connecté avec votre propre compte** (Paramètres
  Cursor › MCP, serveur Atlassian officiel, authentification OAuth).
  C'est ce compte qui sera le rapporteur des stories : le pipeline les
  retrouve grâce à lui. Ne partagez pas de compte et ne collez aucun
  jeton dans un fichier ou dans le chat.
- Un accès en lecture et en création de tickets de type Story dans le
  projet Jira visé, et **au moins une epic que vous avez créée vous-même**
  dans ce projet (vous en êtes le rapporteur), avec un périmètre
  (inclus / hors périmètre) et des critères de réussite. Vous n'avez
  jamais à saisir sa clé : la skill liste vos epics et vous choisissez.

## 2. Installation

1. Décompressez `specify-cursor-kit.zip` **à la racine du dossier de
   travail ouvert dans Cursor** :

   ```bash
   cd chemin/vers/mon-projet
   unzip chemin/vers/specify-cursor-kit.zip
   ```

   Vous obtenez `.cursor/` et ce `README.md` à la racine. Si le projet a
   déjà un `.cursor/`, les dossiers fusionnent ; un fichier de même nom
   est remplacé (`unzip` demande confirmation). Le dossier commence par
   un point : il peut être masqué dans votre explorateur de fichiers.
2. Rechargez Cursor ou ouvrez un nouveau chat Agent.
3. Vérifiez :
   - tapez `/` : `refinement-us` et `publier` apparaissent ;
   - Paramètres Cursor › Rules : `us-redaction` est listée, toujours
     appliquée ;
   - Paramètres Cursor › Subagents (ou Agents) : `us-reviewer` et
     `jira-story-publisher` sont listés ;
   - `/refinement-us` puis « Bonjour, je suis prêt. » : la skill affiche
     la liste numérotée de vos epics (celles dont vous êtes le rapporteur)
     et vous demande laquelle affiner.
4. Testez la lecture Jira sans rien créer, dans un nouveau chat :

   ```text
   Avec les outils MCP Atlassian déjà connectés, sur le site <SITE_JIRA>,
   liste les epics du projet <PROJET_JIRA> dont je suis le rapporteur :
   project = <PROJET_JIRA> AND issuetype = Epic AND reporter = currentUser()
   Ne crée rien, ne modifie rien, ne commente rien.
   Donne pour chacune sa clé, son titre et son statut.
   ```

## 3. Configuration

### Les paramètres, en un seul endroit

Tout ce qui dépend de votre Jira est dans la section « Paramètres du
pipeline Specify » de **`.cursor/rules/us-redaction.mdc`** :

| Paramètre | Défaut (atelier) | À mettre |
|-----------|------------------|----------|
| `SITE_JIRA` | `VOTRE-SITE.atlassian.net` | Votre site Atlassian, sans `https://`. |
| `PROJET_JIRA` | `AS2` | La clé de votre projet Jira (préfixe des tickets). |

La skill et les deux subagents lisent ces valeurs dans la rule ; les
fichiers n'utilisent plus que les noms `SITE_JIRA` et `PROJET_JIRA`. Ouvrez un nouveau chat après modification.

### Comment le pipeline retrouve vos epics et vos stories

Tout se retrouve par son créateur, jamais par une clé saisie :

- **Epics** : la skill liste
  `project = PROJET_JIRA AND issuetype = Epic AND reporter = currentUser()`
  et vous choisissez dans la liste. Coller un lien ou
  une clé reste possible en option, mais l'epic doit figurer dans cette
  liste ; sinon elle est refusée. Le publieur revérifie que vous êtes
  le rapporteur de l'epic.
- **Stories** : avant toute création, `jira-story-publisher` cherche les
  Stories du projet dont `parent` = l'epic choisie et
  `reporter = currentUser()`, puis les associe par le préfixe du titre
  `US-<NN> · `.

Conséquences :

- `currentUser()` est le compte de la connexion MCP. Si vous changez de
  compte, les stories déjà publiées ne sont plus retrouvées et une
  relance créerait des doublons.
- Le publieur ne renseigne jamais le rapporteur et ne touche jamais une
  story d'un autre rapporteur.
- Le préfixe `US-<NN> · ` du titre est le repère de rapprochement : ne le
  supprimez pas et ne le renumérotez pas dans Jira.

### Tous les endroits à adapter pour un autre projet Jira

| Quoi | Où | Obligatoire ? |
|------|----|---------------|
| Site et projet | `.cursor/rules/us-redaction.mdc`, tableau des paramètres | Oui |
| Type d'issue `Story` et champ `parent` | `.cursor/agents/jira-story-publisher.md` (sections 4, 6, 8 et « Parent Jira ») | Si votre projet n'a pas de type Story ou rattache autrement à l'epic |
| Champs obligatoires du type Story | Rien à écrire : le publieur lit les champs requis et note « échec » plutôt que d'inventer une valeur | Vérifier au premier aperçu |
| Labels `prete` / `brouillon` | `jira-story-publisher.md` (sections 3, 5, 6, 8, « Labels »), `us-reviewer.md` (Sortie), `SKILL.md` (étape 9), `references/definition-of-ready.md` | Seulement si vos conventions de labels diffèrent ; garder deux labels exclusifs |
| Préfixe de titre `US-<NN> · ` | `references/template-user-story.md` et `jira-story-publisher.md` (sections 4, 6, 8), ensemble | Non recommandé : change la recherche de l'existant |
| Type d'issue `Epic` dans la requête de la liste | `SKILL.md` (étape 1) | Si votre Jira nomme ce type autrement |
| Barème d'Estimation IA | `SKILL.md` (Format), `references/template-user-story.md`, rule (exception) | Optionnel |
| Exemples annotés (epic générique fictive « Commentaires collaboratifs sur les pages partagées ») | `references/exemple-bonne-us.md`, `exemple-mauvaise-us.md` | Non : simples illustrations |

Les mentions « jour 3 », « jour 5 », « Flow Mapper » et « Quality »
renvoient aux étapes suivantes de l'Agentic SDLC qui lisent les stories
dans Jira ; elles n'empêchent pas d'utiliser le kit seul.

## 4. Utilisation

### Étape 1 · Refinement avec la skill

Dans un nouveau chat Agent : `/refinement-us`. La skill liste vos epics
(rapporteur = vous) et vous répondez par le numéro de celle à affiner ;
elle ne vous demande jamais de clé. Elle avance **une étape à la fois**,
avec une à trois questions par message, et attend votre réponse :

1. lecture de l'epic en lecture seule et résumé ;
2. contrôle d'entrée (critères de réussite, périmètre) ; les compléments
   restent dans le chat, l'epic n'est jamais modifiée ;
3. découpage en US-01, US-02… à valider (numéros stables ensuite) ;
4. challenge story par story (grille), puis rédaction au template :
   récit En tant que / Je veux / Afin de, critères AC-1, AC-2… en
   Given / When / Then, critère de réussite de l'epic et indicateur,
   plan de taggage, Estimation IA ;
5. tableau de la Definition of Ready (12 points) dans chaque story.

Vous êtes le PO : vous décidez. « Je ne sais pas » laisse le point
« à clarifier ». La skill n'invente ni chiffre, ni règle, ni persona.

### Étape 2 · Relecture par us-reviewer

La skill délègue d'elle-même le texte complet des stories à
`us-reviewer`, sans résumé de l'échange. Il rend un verdict par point
DoR. Tranchez chaque écart : la décision est écrite dans la story, ou
le point reste « à clarifier ». Le désaccord est normal : c'est son rôle.

### Étape 3 · GO explicite (obligatoire)

Rien ne part sans un message de votre part de la forme exacte :

```text
GO publication US-01, US-02
```

Seules les stories nommées dans le GO sont traitées ; le GO porte sur
l'epic choisie au début du chat, sans la renommer.

### Étape 4 · Mode aperçu (aucune écriture Jira)

La skill lance d'abord `jira-story-publisher` en **mode aperçu** : il
lit l'epic et les stories existantes et rend le tableau des actions
prévues (créer, mettre à jour, inchangée, ignorer) et des labels
prévus, sans rien écrire. Vérifiez-le et donnez votre accord.

### Étape 5 · Publication avec /publier

Tapez `/publier` dans le même chat. La commande retrouve le dernier GO
et l'epic choisie dans ce chat (sans elle, elle propose `/refinement-us`),
vérifie qu'un aperçu a été rendu (sinon elle le lance et attend votre
accord), puis lance **un publieur par story, en parallèle**, jamais deux
sur la même story. Elle fusionne les résultats en un tableau :

| US | Clé Jira | Lien | Action | Labels | Points DoR à clarifier | Contrôles | À valider |
|----|----------|------|--------|--------|------------------------|-----------|-----------|

Les clés sont celles réellement créées. Relancer `/publier` avec le même
contenu ne crée aucun doublon : les stories déjà publiées sont mises à
jour ou notées « inchangée ». Cursor demande une confirmation pour les
outils MCP d'écriture : acceptez au cas par cas.

## 5. Labels `prete` et `brouillon`

| Label Jira | Statut du pipeline | Quand |
|------------|--------------------|-------|
| `brouillon` | `drafted` | Au moins un point DoR applicable « à clarifier », listé dans la section « Points DoR à clarifier » de la description. |
| `prete` | `ready_for_proto_and_qa` | Les 12 points sont satisfaits ou non applicables. |

Les deux sont publiées ; jamais les deux labels à la fois. Seules les
stories `prete` partent au prototypage. Pour passer une story de
`brouillon` à `prete`, reprenez son refinement, puis republiez : la même
story est mise à jour. Le publieur revérifie la DoR ; si son verdict
diffère du tableau de la story, le label suit son verdict et l'écart
est noté dans « À valider ».

## 6. Estimation IA

À la place des story points, chaque story porte une section
« Estimation IA » sur la ligne
`- Taille : XS|S|M|L|XL · Tokens estimés : <ordre de grandeur>` :
tokens que l'agent consommera pour réaliser la story en développement.
Barème indicatif, à calibrer : XS < 50 k, S 50 k–200 k, M 200 k–1 M,
L 1 M–3 M, XL > 3 M. La skill propose, vous validez. Un L pose la
question du redécoupage, un XL doit être redécoupé. Cette section
n'entre pas dans la DoR et ne bloque pas `prete`.

## 7. Sécurité

- **Commencez sur une epic de test** que vous avez créée, dans un
  projet où des stories de test ne gênent personne. Faites tourner
  l'aperçu avant toute publication.
- **L'epic n'est jamais modifiée** : ni champs, ni description, ni
  commentaires. Les compléments restent dans le chat.
- Aucune écriture Jira sans votre GO explicite ; le mode aperçu
  n'écrit jamais ; aucun ticket n'est supprimé ; statut, assigné et
  commentaires des stories ne sont pas touchés.
- **Aucun secret** dans ces fichiers ni dans le chat : l'authentification
  passe uniquement par le MCP Atlassian. Ne désactivez pas globalement
  les confirmations des outils MCP.
- Aucun export de fichier : Jira est l'unique source des stories.

## 8. Dépannage

| Symptôme | Action |
|----------|--------|
| Aucun outil Atlassian dans le chat | Paramètres Cursor › MCP : serveur Atlassian activé, authentification relancée, puis nouveau chat. |
| Accès refusé ou mauvais site | Reconnectez-vous avec votre compte et choisissez le site de `SITE_JIRA`. Vérifiez la valeur dans la rule. |
| La liste de vos epics est vide | Vous n'êtes rapporteur d'aucune epic de `PROJET_JIRA`, ou le MCP utilise un autre compte. Créez votre epic, vérifiez `PROJET_JIRA` dans la rule et le compte MCP. Ne prenez pas l'epic d'un collègue. |
| La skill refuse l'epic collée | Elle n'est pas dans votre liste : autre projet, autre rapporteur ou autre type. Choisissez dans la liste. |
| La liste ne trouve aucune epic alors qu'elles existent | Le type s'appelle peut-être autrement (par exemple « Épopée ») : adaptez `issuetype` à l'étape 1 de `SKILL.md`. |
| La rule n'est pas appliquée (chiffre inventé, Gherkin en français) | Extension `.mdc`, dossier `.cursor/rules/`, `alwaysApply: true` entre deux lignes `---`. Nouveau chat. |
| `/refinement-us` n'apparaît pas | Chemin `.cursor/skills/refinement-us/SKILL.md`, frontmatter entre `---`, `name` identique au nom du dossier. Le kit est-il à la racine du dossier ouvert ? |
| `/publier` n'apparaît pas | Chemin `.cursor/commands/publier.md`. Nouveau chat ou rechargement de Cursor. |
| Le subagent n'est pas appelé | Vérifiez `.cursor/agents/` et l'en-tête du fichier. Demandez « Délègue au subagent jira-story-publisher ». |
| La skill rédige tout sans poser de questions | Rappelez : une étape à la fois, une à trois questions, attendre la réponse du PO. Relancez `/refinement-us`. |
| us-reviewer réécrit la story ou semble connaître l'échange | Vérifiez `readonly: true`. Demandez de ne lui transmettre que le texte des stories. |
| Le subagent s'arrête avec une liste de manques | Voulu : il ne peut pas dialoguer. Complétez dans le chat de la skill et relancez. |
| Les publieurs tournent l'un après l'autre | Le résultat reste valable. Pour du parallèle : « lance en parallèle un subagent jira-story-publisher par story ». |
| `reporter = currentUser()` ne retrouve pas mes stories | Le MCP utilise un autre compte : reconnectez-le avec le compte qui a publié. Ne forcez jamais un rapporteur. |
| Doublon | Deux publieurs ont reçu la même story, ou le compte MCP a changé. Arrêtez ; ne supprimez rien à la main. |
| Story publiée avec `brouillon` | Normal si un point DoR reste à clarifier. Reprenez le refinement, puis republiez. |
| Story avec `prete` et `brouillon` | Corrigez la règle des labels du publieur et republiez : il met à jour la même story. |
| Story en sous-tâche ou sans parent | Le type doit être Story et le champ `parent` votre epic. Voir la section Configuration si votre projet diffère. |
| Champ obligatoire manquant | Le publieur note « échec » avec le champ : ajustez le projet Jira ou le publieur, sans valeur arbitraire. |
| Création partielle ou délai dépassé | Relancez `/publier` : la recherche préalable reprend sans doublon. |
| Jira indisponible | Continuez refinement, relecture et aperçu ; publiez à la reprise. |
