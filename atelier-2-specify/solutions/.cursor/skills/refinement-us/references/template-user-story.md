# US-<NN> · <Titre court, verbe à l'infinitif>

## Récit
En tant que <persona>
Je veux <action>
Afin de <bénéfice>

## Persona et besoin
- Persona : <qui, précisément ; jamais « l'utilisateur »>
- Besoin : <le problème vécu, avec ses mots>
- Source du besoin : <avis client cité, ou section de l'epic>

## Valeur et mesure
- Critère de réussite de l'epic visé : <citation exacte de l'epic>
- Incrément de valeur autonome : <ce que le persona peut faire
  avec cette seule story livrée>
- Indicateur de succès de la story : <nom de l'indicateur, obligatoire>
- Cible : <valeur validée par le PO | à préciser>

## Périmètre
- Inclus :
- Exclus : <dont les exclusions de l'epic qui s'appliquent>

## Règles et permissions
- <règle> (source : <epic / décision PO du JJ/MM>)

## Écrans, données et états (pour le prototype)
- Écrans ou zones : 
- Données affichées ou saisies : 
- États : nominal · vide · chargement · erreur · droits insuffisants

## Critères d'acceptation
```gherkin
Feature: <capacité, en français>

  Scenario: AC-1 · <cas nominal, en français>
    Given <contexte>
    When <événement>
    Then <résultat observable>

  Scenario: AC-2 · <titre, en français>
    Given <contexte>
    When <événement>
    Then <résultat observable>

  (AC-3, AC-4… : autant que nécessaire, même forme)
```

## Plan de taggage
| Événement | Déclencheur | Propriétés |
|-----------|-------------|------------|

## Estimation IA
- Taille : XS|S|M|L|XL · Tokens estimés : <ordre de grandeur>
<Consigne : ordre de grandeur des tokens consommés par l'agent pour
réaliser la story en développement (jour 5), pas le prototype du jour 3.
Barème indicatif, à calibrer au jour 5 : XS < 50 k, S 50 k–200 k, M 200 k–1 M, L 1 M–3 M, XL > 3 M.
Proposée par la skill, validée par le PO. XL : à redécouper.
Non bloquante pour la DoR.>

## Non fonctionnel (si pertinent)
- <accessibilité, performance, sécurité, RGPD… seulement si établi>

## Dépendances et hypothèses
- 

## Questions ouvertes (non bloquantes)
- 

## Definition of Ready
| # | Point | Statut | Justification |
|---|-------|--------|---------------|

## Points DoR à clarifier
<Seulement si la story part avec le label « brouillon » :
un point par ligne, avec la décision ou l'information manquante.
Vide si la story est prête.>

## À valider
<Tout complément ajouté par un agent sans validation du PO.
Vide si rien.>
