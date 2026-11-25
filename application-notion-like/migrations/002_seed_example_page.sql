insert into pages (id, title, blocks)
values (
  'plan-de-lancement',
  'Plan de lancement',
  '[
    {"id": "b1", "type": "heading", "text": "Objectifs"},
    {"id": "b2", "type": "paragraph", "text": "Lancer la première version auprès des équipes pilotes."},
    {"id": "b3", "type": "bullet", "text": "Pages avec blocs simples"},
    {"id": "b4", "type": "bullet", "text": "Création, édition et suppression de pages"}
  ]'::jsonb
)
on conflict (id) do nothing;
