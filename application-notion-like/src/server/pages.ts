import { randomUUID } from "node:crypto";
import type { Block, CoverKey, Page, PageSummary } from "../shared/types.js";
import { cleanBlocks, cleanCover, cleanIcon, cleanTitle, ValidationError } from "../shared/validation.js";
import { sql } from "./db.js";
import { HttpError } from "./errors.js";

/**
 * Modèle de page : règles métier et requêtes SQL (table pages, voir migrations/).
 * Arborescence par parent_id ; corbeille par trashed_at (une page et toutes ses sous-pages ensemble).
 */

const MAX_PAGES = 1000;

interface PageRow {
  id: string;
  title: string;
  icon: string | null;
  cover: CoverKey | null;
  parent_id: string | null;
  position: number;
  blocks: Block[];
  created_at: Date | string;
  updated_at: Date | string;
  trashed_at: Date | string | null;
}

const iso = (value: Date | string): string => new Date(value).toISOString();

const toSummary = (row: PageRow): PageSummary => ({
  id: row.id,
  title: row.title,
  icon: row.icon,
  parentId: row.parent_id,
  position: row.position,
  updatedAt: iso(row.updated_at),
  trashedAt: row.trashed_at === null ? null : iso(row.trashed_at),
});

const toPage = (row: PageRow): Page => ({
  ...toSummary(row),
  cover: row.cover,
  blocks: row.blocks,
  createdAt: iso(row.created_at),
});

/** Convertit les erreurs de validation en réponses 400. */
function validated<T>(run: () => T): T {
  try {
    return run();
  } catch (err) {
    if (err instanceof ValidationError) throw new HttpError(400, err.message);
    throw err;
  }
}

const SUBTREE = `with recursive subtree as (
    select id from pages where id = $1
    union all
    select p.id from pages p join subtree s on p.parent_id = s.id
  )`;

const SUMMARY_COLUMNS = "id, title, icon, parent_id, position, updated_at, trashed_at";

/** Pages actives, triées pour construire l'arborescence. */
export async function listPages(): Promise<PageSummary[]> {
  const rows = await sql<PageRow>(
    `select ${SUMMARY_COLUMNS} from pages where trashed_at is null order by position, created_at, id limit $1`,
    [MAX_PAGES],
  );
  return rows.map(toSummary);
}

/** Corbeille : pages supprimées dont le parent n'est pas lui-même dans la corbeille. */
export async function listTrash(): Promise<PageSummary[]> {
  const rows = await sql<PageRow>(
    `select ${SUMMARY_COLUMNS.split(", ").map((c) => `p.${c}`).join(", ")}
     from pages p left join pages parent on parent.id = p.parent_id
     where p.trashed_at is not null and (parent.id is null or parent.trashed_at is null)
     order by p.trashed_at desc limit $1`,
    [MAX_PAGES],
  );
  return rows.map(toSummary);
}

export async function getPage(id: string): Promise<Page> {
  const [row] = await sql<PageRow>("select * from pages where id = $1", [id]);
  if (!row) throw new HttpError(404, "Page introuvable.");
  return toPage(row);
}

export async function createPage(input: {
  title?: unknown;
  blocks?: unknown;
  icon?: unknown;
  cover?: unknown;
  parentId?: unknown;
}): Promise<Page> {
  const title = validated(() => (input.title === undefined ? "" : cleanTitle(input.title)));
  const blocks = validated(() => (input.blocks === undefined ? [] : cleanBlocks(input.blocks, randomUUID)));
  const icon = validated(() => (input.icon === undefined ? null : cleanIcon(input.icon)));
  const cover = validated(() => (input.cover === undefined ? null : cleanCover(input.cover)));
  let parentId: string | null = null;
  if (input.parentId !== undefined && input.parentId !== null) {
    if (typeof input.parentId !== "string") throw new HttpError(400, "Page parente : identifiant attendu.");
    const parent = await getPage(input.parentId).catch(() => null);
    if (!parent || parent.trashedAt !== null) throw new HttpError(400, "Page parente introuvable.");
    parentId = parent.id;
  }
  const [count] = await sql<{ n: string | number }>("select count(*) as n from pages");
  if (Number(count?.n ?? 0) >= MAX_PAGES) throw new HttpError(409, `Limite de ${MAX_PAGES} pages atteinte.`);
  const [row] = await sql<PageRow>(
    `insert into pages (id, title, blocks, icon, cover, parent_id, position)
     values ($1, $2, $3::jsonb, $4, $5, $6,
       (select coalesce(max(position) + 1, 0) from pages where parent_id is not distinct from $6))
     returning *`,
    [randomUUID(), title, JSON.stringify(blocks), icon, cover, parentId],
  );
  return toPage(row as PageRow);
}

export async function updatePage(
  id: string,
  input: { title?: unknown; blocks?: unknown; icon?: unknown; cover?: unknown; trashed?: unknown },
): Promise<Page> {
  const current = await getPage(id);
  if (input.trashed !== undefined) {
    if (typeof input.trashed !== "boolean") throw new HttpError(400, "Corbeille : booléen attendu.");
    if (input.trashed) await trashPage(id);
    else if (current.trashedAt !== null) await restorePage(id);
  }
  const title = input.title === undefined ? current.title : validated(() => cleanTitle(input.title));
  const blocks = input.blocks === undefined ? current.blocks : validated(() => cleanBlocks(input.blocks, randomUUID));
  const icon = input.icon === undefined ? current.icon : validated(() => cleanIcon(input.icon));
  const cover = input.cover === undefined ? current.cover : validated(() => cleanCover(input.cover));
  const [row] = await sql<PageRow>(
    `update pages set title = $2, blocks = $3::jsonb, icon = $4, cover = $5, updated_at = now()
     where id = $1 returning *`,
    [id, title, JSON.stringify(blocks), icon, cover],
  );
  return toPage(row as PageRow);
}

async function trashPage(id: string): Promise<void> {
  await sql(`${SUBTREE} update pages set trashed_at = now() where id in (select id from subtree) and trashed_at is null`, [
    id,
  ]);
}

/** Restaure la page et ses sous-pages ; si sa page parente est encore dans la corbeille, elle revient à la racine. */
async function restorePage(id: string): Promise<void> {
  await sql(`${SUBTREE} update pages set trashed_at = null where id in (select id from subtree)`, [id]);
  await sql(
    `update pages set parent_id = null
     where id = $1 and parent_id in (select id from pages where trashed_at is not null)`,
    [id],
  );
}

/** Suppression définitive, réservée aux pages de la corbeille ; les sous-pages suivent (on delete cascade). */
export async function deletePage(id: string): Promise<void> {
  const page = await getPage(id);
  if (page.trashedAt === null) throw new HttpError(409, "Placez d'abord la page dans la corbeille.");
  await sql("delete from pages where id = $1", [id]);
}
