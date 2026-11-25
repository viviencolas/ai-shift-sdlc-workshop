# Solutions de secours · Atelier 2 « Specify » (8 décembre 2026)

Jeu complet des cinq briques de l'atelier, pour un participant bloqué.
Ce sont les versions abouties des squelettes du guide participant :
à utiliser seulement après avoir essayé de construire les vôtres.

## Contenu

Le dossier `.cursor/` ci-contre est celui à copier à la racine de votre projet.

```
solutions/.cursor/
├── rules/us-redaction.mdc              rule, toujours appliquée
├── skills/refinement-us/
│   ├── SKILL.md                        skill de refinement (/refinement-us)
│   └── references/                     DoR, DoD, template, grille, deux exemples
├── agents/
│   ├── us-reviewer.md                  relecteur à froid, lecture seule
│   └── jira-story-publisher.md         publieur Jira, modes aperçu et publication
└── commands/publier.md                 commande /publier
```

## Copier dans votre projet

À la racine du dossier de travail ouvert dans Cursor :

```bash
mkdir -p .cursor
cp -R chemin/vers/atelier-2-specify/solutions/.cursor/. .cursor/
```

La copie écrase vos fichiers de même nom. Pour ne remplacer qu'une
brique, copiez seulement son fichier (par exemple
`.cursor/agents/jira-story-publisher.md` vers `.cursor/agents/`).
Sans terminal : créez les dossiers dans Cursor et collez le contenu
de chaque fichier avec le même nom.

## Vérifier

1. Ouvrez un nouveau chat Agent (ou rechargez Cursor).
2. Tapez `/` : `refinement-us` et `publier` apparaissent.
3. `/refinement-us` puis « Bonjour, je suis prêt. » : la skill liste les
   epics AS2 dont vous êtes le rapporteur et vous demande laquelle
   affiner. Aucune clé à saisir.
4. Reprenez le guide à l'exercice où vous étiez bloqué.

Aucun secret dans ces fichiers. Rien n'écrit dans Jira sans votre GO
explicite, et le mode aperçu du publieur n'écrit jamais.
