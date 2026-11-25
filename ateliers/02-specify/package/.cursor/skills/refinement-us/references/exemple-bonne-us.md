# Exemple annoté · une bonne US
# Epic d'exemple générique et fictive : « Commentaires collaboratifs sur les pages partagées ».
# Vous affinez une de vos propres epics, choisie dans la liste de la skill.
# Exemple fictif : les décisions marquées « PO » sont supposées
# prises pendant le refinement. Ne les recopiez pas pour votre epic.
# Les lignes « → [...] » sont des annotations : elles ne vont pas dans Jira.

# US-04 · Assigner un commentaire à un membre de l'espace
  → [Titre Jira : numéro US-<NN> validé au découpage, puis titre court]

## Récit
En tant que responsable d'une page partagée
Je veux assigner un commentaire à un membre de l'espace
Afin de garantir que chaque remarque ait une personne chargée de la traiter
  → [Structure du pivot, persona précis : DoR 01 et 09]

## Persona et besoin
- Persona : responsable d'une page, qui reçoit des commentaires
  de plusieurs relecteurs.
- Besoin : savoir qui doit traiter chaque remarque, pour qu'aucune
  ne reste sans suite.
- Source du besoin : epic « Commentaires collaboratifs sur les pages partagées », besoin « assigner un commentaire ».
  → [Source citée : DoR 10]

## Valeur et mesure
- Critère de réussite de l'epic visé : « 80 % des commentaires assignés
  résolus ou traités sous 3 jours ».
- Incrément de valeur autonome : sans notification ni temps réel,
  l'assigné voit les commentaires qui lui sont assignés sur la page.
- Indicateur de succès de la story : taux de résolution des commentaires assignés
- Cible : à préciser
  → [Critère cité et un seul indicateur nommé ; la cible peut attendre : DoR 11]

## Périmètre
- Inclus : assigner, réassigner, retirer l'assignation.
- Exclus : notification email ou push, échéance (hors epic) ;
  centre de notifications (US-05).
  → [Exclusions de l'epic rappelées : DoR 02]

## Règles et permissions
- Seul un membre ayant accès à la page peut être assigné (source : décision PO du 08/12).
- Un lecteur seul peut commenter mais pas assigner (source : décision PO du 08/12).
- Un commentaire n'a qu'un assigné à la fois (source : décision PO du 08/12).
  → [Règles datées et sourcées : DoR 03]

## Écrans, données et états (pour le prototype)
- Écrans ou zones : fil de commentaire dans la marge de la page.
- Données affichées ou saisies : nom et avatar de l'assigné, date d'assignation.
- États : non assigné · assigné · fil résolu · assigné sans accès.
  → [Utilisable par le prototype J3 : DoR 12]

## Critères d'acceptation
```gherkin
Feature: Assigner un commentaire

  Scenario: AC-1 · Le responsable assigne un commentaire à un membre
    Given Léa, responsable de la page "Plan de lancement", voit un commentaire non assigné et Hugo a accès à la page
    When Léa assigne ce commentaire à Hugo
    Then le commentaire affiche Hugo comme assigné et Hugo le retrouve parmi ceux qui lui sont assignés

  Scenario: AC-2 · Le responsable réassigne un commentaire
    Given un commentaire de la page est assigné à Hugo
    When Léa l'assigne à Inès
    Then le commentaire affiche Inès comme seule assignée

  Scenario: AC-3 · Un membre sans accès à la page ne peut pas être assigné
    Given Marc n'a pas accès à la page "Plan de lancement"
    When Léa cherche Marc pour lui assigner un commentaire
    Then Marc n'est pas proposé

  Scenario: AC-4 · Un lecteur seul ne peut pas assigner
    Given Sami a un accès en lecture seule à la page
    When Sami consulte un commentaire non assigné
    Then aucune action d'assignation ne lui est proposée et il peut toujours y répondre
```
  → [4 critères AC-N, un Given / When / Then chacun, texte français,
     mots-clés anglais, refus et droits couverts : DoR 04 et 05.
     Le nombre suit les règles, sans chiffre imposé.]

## Plan de taggage
| Événement | Déclencheur | Propriétés |
|-----------|-------------|------------|
| commentaire assigné | assignation ou réassignation | id_commentaire, id_page, role_auteur, reassignation (oui/non) |
| fil résolu | passage du fil à « résolu » | id_commentaire, id_page, etait_assigne, delai_depuis_assignation |
  → [Prépare la DoD 02 et 03]

## Estimation IA
- Taille : M · Tokens estimés : 200 k à 1 M
  → [Proposée par la skill d'après 4 AC, une zone d'écran, les membres
     de l'espace et aucune intégration externe ; validée par le PO.
     Réalisation au jour 5, barème à calibrer. Hors DoR, non bloquante.]

## Non fonctionnel (si pertinent)
- Accessibilité : le choix de l'assigné est utilisable au clavier (source : décision PO du 08/12).
  → [Seulement ce qui est établi ; sinon, la section reste vide]

## Dépendances et hypothèses
- US-02 (répondre en fil et résoudre) fournit l'état « résolu ».
- Hypothèse : la liste des membres de l'espace est disponible.
  → [DoR 06]

## Questions ouvertes (non bloquantes)
- « Traité » compte-t-il comme « résolu » dans l'indicateur ?
- Faut-il suivre aussi le délai entre assignation et résolution ?
  → [Non bloquantes pour le prototype : DoR 07, la story reste prête]

## Definition of Ready
| # | Point | Statut | Justification |
|---|-------|--------|---------------|
| 01 | Structure En tant que / Je veux / Afin de | satisfait | Récit en trois lignes |
| 02 | Périmètre et exclusions | satisfait | Inclus et exclus listés, exclusions de l'epic rappelées |
| 03 | Règles et permissions | satisfait | Trois règles, décisions PO du 08/12 |
| 04 | Critères AC-N en Given / When / Then | satisfait | AC-1 à AC-4 |
| 05 | États et variantes | satisfait | Refus (AC-3, AC-4) et états listés |
| 06 | Dépendances et hypothèses | satisfait | US-02 et liste des membres |
| 07 | Aucune question bloquante | satisfait | Deux questions, non bloquantes pour le prototype |
| 08 | Fidèle au découpage, autonome | satisfait | US-04 du découpage validé, lisible sans le chat |
| 09 | Persona précis | satisfait | Responsable d'une page partagée |
| 10 | Source du besoin | satisfait | Epic « Commentaires collaboratifs sur les pages partagées », besoin « assigner un commentaire » |
| 11 | Critère de l'epic et indicateur | satisfait | Critère cité, indicateur nommé, cible à préciser |
| 12 | Écrans, données et états | satisfait | Marge de la page, assigné, date, quatre états |

## Points DoR à clarifier
(vide : story prête)

## À valider
(vide)

Verdict : prête → label prete (statut ready_for_proto_and_qa).
