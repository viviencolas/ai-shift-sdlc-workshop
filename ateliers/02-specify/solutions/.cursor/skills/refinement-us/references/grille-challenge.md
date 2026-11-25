# Grille de challenge · une story à la fois

Poser une à trois questions par message. Attendre la réponse du PO.
Ne jamais répondre à sa place ; une inconnue reste « à clarifier ».

## 1. Pourquoi, besoin, persona
- Qui exactement vit ce problème ? Quel rôle, quels droits ?
- Quel est le besoin réel, derrière la fonctionnalité demandée ?
- D'où vient-il : quel avis client, quelle section de l'epic ?
  Si aucune source : est-ce une hypothèse du PO ?
- Peut-on l'écrire en « En tant que / Je veux / Afin de » sans
  forcer ? Sinon, le besoin n'est pas encore clair.

## 2. Incrément de valeur autonome
- Livrée seule, que permet cette story au persona ?
- Peut-on la montrer en démo sans les autres stories ?
- Dépend-elle d'une autre story ? Laquelle, et pourquoi ?

## 3. Découpage
- Trop grosse : contient-elle plusieurs besoins ou personas ?
  Proposer une scission par valeur (jamais front / back).
- La liste des critères d'acceptation devient très longue ?
  C'est le signal d'une story à redécouper.
- Estimation IA en L (1 M à 3 M tokens) ? Demander au PO si l'on
  redécoupe. En XL (plus de 3 M) : redécouper.
- Trop petite : apporte-t-elle une valeur seule ? Sinon, fusion.
- Doublon : recouvre-t-elle une autre story du découpage ou
  une story déjà présente sous l'epic ?
- Hors périmètre : touche-t-elle une exclusion de l'epic ?

## 4. Mesure
- À quel critère de réussite de l'epic contribue-t-elle ? (obligatoire)
- Quel est le nom de l'indicateur propre à la story ? (obligatoire)
- Quels événements faut-il tracer pour le calculer ?
- Une cible chiffrée existe-t-elle ? Sinon : « à préciser ».
  Ne jamais proposer de chiffre comme s'il était acquis.

## 5. Cas oubliés
- Erreurs : que se passe-t-il si l'action échoue ?
- Droits : qui peut, qui ne peut pas ? Lecteur, éditeur, invité ?
- Cas limites : élément supprimé, déjà traité, personne partie ?
- États : liste vide, premier usage, chargement, hors ligne ?

## 6. Avant de rédiger
- Reformuler la story en une phrase et la faire valider.
- Lister les critères qui découlent réellement des règles (AC-1, AC-2…).
- Lister les décisions prises pendant l'échange, avec leur date.
- Proposer la taille XS à XL d'après les AC, les écrans, les données
  et les intégrations ; le PO la valide.
