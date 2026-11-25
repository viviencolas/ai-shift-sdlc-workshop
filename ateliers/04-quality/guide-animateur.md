# Guide facilitateur — Atelier 4 · Quality

> **Lead** : Ismael TRAORE · **Jeudi 17 h – 19 h** · 20 participants, 4 sous-groupes de 5.
> **Objectif** : chaque sous-groupe produit un `test-plan.yaml` conforme pour chaque US du sous-groupe Prototype « miroir », + met à jour les US ambiguës dans Jira.

## Checklist pré-session (J-1, 30 min max)

- [ ] Les stories Jira de mardi sont bien en statut `ready_for_proto_and_qa`.
- [ ] Xray Test Management est actif sur le project `AISDLC` ; **sinon** fallback : type d'issue `Test Case` + label `aisdlc:test` déjà en place.
- [ ] Les 3 custom modes activés : `aisdlc.quality.ambiguity-hunter`, `aisdlc.quality.test-strategist`, `aisdlc.quality.scenario-writer`.
- [ ] L'attribution reproduit celle de Prototype : chaque sous-groupe Quality prend **les mêmes** US que son sous-groupe Prototype miroir, afin de comparer en restitution.
- [ ] Les data_requirements types (comptes de test, stubs API) sont documentés dans Confluence `AISDLC/test-data`.

## Timing détaillé (17 h – 19 h)

| Heure | Durée | Phase | Détail |
|---|---|---|---|
| 17 h 00 | 10 min | Accueil | Rappel du parallèle avec Prototype. Objectif : US qui ne plantent pas l'agent dev vendredi. |
| 17 h 10 | 20 min | Démo | Ismael joue le squad sur 1 US volontairement floue. Montrer les 3 types d'ambiguïtés. |
| 17 h 30 | 70 min | Lab | 4 sous-groupes. Produire ambiguités → stratégie → scénarios + maj Jira. |
| 18 h 40 | 20 min | Restitution | 1 ambiguïté remarquable par sous-groupe + reformulation adoptée. Les reformulations sont reportées sur les US pour vendredi. |

## Prompts de lancement (Composer)

**Ambiguity Hunter**
```
Mode: aisdlc.quality.ambiguity-hunter
Entrée : docs/specify/<story-key>/user-story.yaml.
Sortie : docs/quality/<story-key>/ambiguities.yaml.
Types : missing_value | contradiction | untestable | ambiguous_term | unverifiable_reference.
Pour chaque issue : excerpt + location + proposed_fix + severity.
Commentaires Jira [Quality] reformulation uniquement, pas d'édition silencieuse.
```

**Test Strategist**
```
Mode: aisdlc.quality.test-strategist
Entrée : user-story.yaml + ambiguities.yaml.
Sortie : docs/quality/<story-key>/test-strategy.yaml.
Au moins un niveau automatisé sauf justification dans risks[].
```

**Scenario Writer**
```
Mode: aisdlc.quality.scenario-writer
Entrée : user-story.yaml + ambiguities.yaml + test-strategy.yaml.
Sortie : docs/quality/<story-key>/test-plan.yaml conforme à pivots/test-plan.schema.yaml
        + tickets Jira Test (Xray ou Test Case).
Edge cases obligatoires : vide, min/max, non autorisé, concurrence, i18n, timeout.
Coverage[] : AC → TC, complet.
```

## Moments-clés

- **17 h 22** : première liste d'ambiguïtés. Pointer un exemple concret pour tout le monde.
- **18 h 05** : Scenario Writer rédige son premier edge case. Vérifier valeurs concrètes.
- **18 h 35** : check `coverage[]` : un AC sans TC ⇒ statut `ambiguities_raised`, pas `ready_for_code`.

## Critères de clôture (go/no-go pour Code)

- [ ] Un `test-plan.yaml` par US, validant le schéma, statut `ready_for_code` ou `ambiguities_raised` (documenté).
- [ ] 100 % des AC couverts (`coverage[].acceptance_criterion_id` == tous les AC de la story).
- [ ] Ambiguïtés remontées à la Story Jira en commentaire `[Quality]` + proposition de fix.
- [ ] Tickets Jira `Test` (ou `Test Case`) créés et liés à la Story.
- [ ] Récap manuel posté dans `#aisdlc-standup`.

## Pièges fréquents

- **Ambiguïté sans fix** : interdire « clarifier » tout court ; exiger la reformulation précise.
- **Scenario vague** : « un utilisateur » / « une adresse » ⇒ refus. Forcer un nom et une valeur.
- **Status bâclé** : si un seul AC est non couvert, la story n'est **pas** `ready_for_code`.
