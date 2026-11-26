insert into pages (id, title, icon, position, blocks)
values (
  'bienvenue',
  'Bienvenue',
  '👋',
  -1,
  '[
    {"id": "w1", "type": "paragraph", "text": "Cet espace reprend les usages d''un éditeur de type Notion : des pages imbriquées faites de blocs."},
    {"id": "w2", "type": "heading_2", "text": "Pour commencer"},
    {"id": "w3", "type": "todo", "text": "Taper « / » dans un bloc vide pour choisir un type de bloc", "checked": false},
    {"id": "w4", "type": "todo", "text": "Écrire « # » puis espace pour un titre, « - » pour une liste, « [] » pour une case", "checked": false},
    {"id": "w5", "type": "todo", "text": "Survoler un bloc : « + » ajoute un bloc, ⋮⋮ le déplace ou ouvre son menu", "checked": false},
    {"id": "w6", "type": "callout", "text": "Survolez une page dans la barre latérale pour lui ajouter une sous-page.", "icon": "💡"},
    {"id": "w7", "type": "toggle", "text": "Où sont enregistrées les pages ?", "body": "Dans Postgres : Neon en ligne, PGlite en local."},
    {"id": "w8", "type": "divider", "text": ""},
    {"id": "w9", "type": "quote", "text": "Les pages supprimées vont dans la corbeille, d''où on peut les restaurer."}
  ]'::jsonb
)
on conflict (id) do nothing;

insert into pages (id, title, icon, parent_id, position, blocks)
values (
  'raccourcis-clavier',
  'Raccourcis clavier',
  '⌨️',
  'bienvenue',
  0,
  '[
    {"id": "k1", "type": "bulleted_list", "text": "Ctrl/⌘ + K : recherche rapide"},
    {"id": "k2", "type": "bulleted_list", "text": "Ctrl/⌘ + Maj + ↑ / ↓ : déplacer le bloc"},
    {"id": "k3", "type": "bulleted_list", "text": "Entrée : nouveau bloc ; Maj + Entrée : retour à la ligne"},
    {"id": "k4", "type": "code", "text": "# Titre 1\n## Titre 2\n- liste\n1. liste numérotée\n[] case à cocher\n> citation"}
  ]'::jsonb
)
on conflict (id) do nothing;
