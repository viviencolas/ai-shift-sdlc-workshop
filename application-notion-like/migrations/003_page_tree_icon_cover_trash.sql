alter table pages add column parent_id text references pages (id) on delete cascade;
alter table pages add column icon text;
alter table pages add column cover text;
alter table pages add column position integer not null default 0;
alter table pages add column trashed_at timestamptz;
create index pages_parent_id_idx on pages (parent_id);

-- Types de blocs renommés : heading -> heading_2, bullet -> bulleted_list.
update pages
set blocks = (
  select coalesce(
    jsonb_agg(
      case b ->> 'type'
        when 'heading' then jsonb_set(b, '{type}', '"heading_2"')
        when 'bullet' then jsonb_set(b, '{type}', '"bulleted_list"')
        else b
      end
      order by ord
    ),
    '[]'::jsonb
  )
  from jsonb_array_elements(pages.blocks) with ordinality as t (b, ord)
);

update pages set icon = '🚀' where id = 'plan-de-lancement' and icon is null;
