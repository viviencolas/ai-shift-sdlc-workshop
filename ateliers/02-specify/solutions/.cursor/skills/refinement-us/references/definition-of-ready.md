# Definition of Ready · prête à prototyper (J3)

Pour chaque point, noter un statut et une justification courte :
- satisfait : la preuve est dans la story ;
- à clarifier : il manque une décision ou une information ;
- non applicable : le point ne concerne pas cette story (dire pourquoi).

Une story est prête quand aucun point applicable n'est « à clarifier ».
Un bon score moyen ne compense pas un point bloquant.

| #  | Une US prête à prototyper…                                                        |
|----|-----------------------------------------------------------------------------------|
| 01 | Suit la structure En tant que / Je veux / Afin de : acteur, besoin et valeur.     |
| 02 | Explicite le périmètre et les exclusions utiles.                                  |
| 03 | Établit les règles et permissions nécessaires au parcours.                        |
| 04 | Contient des critères d'acceptation numérotés AC-1, AC-2…, chacun en             |
|    | Given / When / Then (mots-clés anglais, texte français), observables et liés     |
|    | aux exigences. Autant que nécessaire ; une liste très longue signale une story   |
|    | à redécouper.                                                                     |
| 05 | Précise les états et variantes pertinents : succès, refus, erreur ou vide.        |
| 06 | Rend visibles les dépendances et hypothèses restantes.                            |
| 07 | Ne laisse aucune question bloquant le comportement à représenter.                 |
| 08 | Reste fidèle au découpage validé par le PO et se comprend sans l'historique du chat. |
| 09 | Nomme un persona précis (pas « l'utilisateur »).                                  |
| 10 | Relie le besoin à sa source : avis client cité ou section de l'epic.              |
| 11 | Cite le critère de réussite de l'epic visé ET nomme son propre indicateur de      |
|    | succès. La valeur cible peut rester « à préciser ».                               |
| 12 | Décrit les écrans, les données et les états utiles au prototype.                  |

Rattachement : chaque story est créée dans Jira avec l'epic source
comme parent (champ parent). Le jour 3 et Quality s'en servent comme
parent_opportunity : une story sans ce parent n'est pas exploitable.

Correspondance avec les statuts du pipeline :
- label brouillon = drafted (au moins un point à clarifier) ;
- label prete = ready_for_proto_and_qa (tous les points satisfaits
  ou non applicables).
Une story non prête est publiée avec le label « brouillon » et la
liste de ses points à clarifier ; elle ne part pas au prototypage.

Le jour 3 lit les stories directement dans Jira : aucun export de fichier.

Rattachement et propriété : la story est enfant d'une epic du participant,
retrouvée parce qu'il en est le rapporteur (reporter = currentUser()),
jamais par une clé saisie ; le rapporteur de la story est aussi le
participant, via sa propre connexion MCP.

Hors DoR, non bloquant : la section Estimation IA (taille XS à XL).

Non requis au J2 : design final, architecture, story points,
tests automatisés, conformité production.
