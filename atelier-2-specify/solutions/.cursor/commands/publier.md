# /publier

Publie dans Jira les stories du dernier GO de ce chat.

1. Retrouve dans ce chat le dernier message de GO du PO
   (« GO publication US-… »). S'il n'existe pas, arrête-toi
   et demande-le. Ne publie rien.
   Retrouve aussi l'epic que le PO a choisie dans ce chat parmi ses epics
   (reporter = currentUser()) et que la skill refinement-us a lue.
   Si aucune epic n'a été choisie ainsi, arrête-toi et propose de lancer
   /refinement-us. Ne demande jamais de clé d'epic.
2. Vérifie qu'un aperçu de jira-story-publisher a été rendu pour
   ces stories. Sinon, lance d'abord le mode aperçu et attends l'accord du PO.
3. Lance en parallèle un subagent jira-story-publisher par story du GO,
   en mode publication. Transmets à chacun : mode (publication), clé de l'epic choisie,
   message de GO mot pour mot, texte complet de SA story uniquement.
   Jamais deux subagents sur la même story.
4. Attends tous les résultats, puis fusionne leurs tableaux en un seul :
   | US | Clé Jira | Lien | Action | Labels | Points DoR à clarifier | Contrôles | À valider |
5. Signale toute story en échec. Une nouvelle exécution de /publier
   reprend sans créer de doublon.
