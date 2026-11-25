import { randomUUID } from "node:crypto";
import type { Block, Page, PageSummary } from "../shared/types.js";
import { cleanBlocks, cleanTitle, ValidationError } from "../shared/validation.js";
import { sql } from "./db.js";
import { HttpError } from "./errors.js";

/** Modèle de page : règles métier et requêtes SQL (table pages, voir migrations/). */

const MAX_PAGES = 500;

interface PageRow {
  id: string;
  title: string;
  blocks: Block[];
  created_at: Date | string;
  updated_at: Date | string;
}

const toPage = (row: PageRow): Page => ({
  id: row.id,
  title: row.title,
  blocks: row.blocks,
  createdAt: new Date(row.created_at).toISOString(),
  updatedAt: new Date(row.updated_at).toISOString(),
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

export async function listPages(): Promise<PageSummary[]> {
  const rows = await sql<Pick<PageRow, "id" | "title" | "updated_at">>(
    "select id, title, updated_at from pages order by updated_at desc, id limit $1",
    [MAX_PAGES],
  );
  return rows.map((r) => ({ id: r.id, title: r.title, updatedAt: new Date(r.updated_at).toISOString() }));
}

export async function getPage(id: string): Promise<Page> {
  const [row] = await sql<PageRow>("select * from pages where id = $1", [id]);
  if (!row) throw new HttpError(404, "Page introuvable.");
  return toPage(row);
}

export async function createPage(input: { title?: unknown; blocks?: unknown }): Promise<Page> {
  const title = validated(() => cleanTitle(input.title));
  const blocks = validated(() => (input.blocks === undefined ? [] : cleanBlocks(input.blocks, randomUUID)));
  const [count] = await sql<{ n: string | number }>("select count(*) as n from pages");
  if (Number(count?.n ?? 0) >= MAX_PAGES) throw new HttpError(409, `Limite de ${MAX_PAGES} pages atteinte.`);
  const [row] = await sql<PageRow>("insert into pages (id, title, blocks) values ($1, $2, $3::jsonb) returning *", [
    randomUUID(),
    title,
    JSON.stringify(blocks),
  ]);
  return toPage(row as PageRow);
}

export async function updatePage(id: string, input: { title?: unknown; blocks?: unknown }): Promise<Page> {
  const current = await getPage(id);
  const title = input.title === undefined ? current.title : validated(() => cleanTitle(input.title));
  const blocks = input.blocks === undefined ? current.blocks : validated(() => cleanBlocks(input.blocks, randomUUID));
  const [row] = await sql<PageRow>(
    "update pages set title = $2, blocks = $3::jsonb, updated_at = now() where id = $1 returning *",
    [id, title, JSON.stringify(blocks)],
  );
  return toPage(row as PageRow);
}

export async function deletePage(id: string): Promise<void> {
  const rows = await sql("delete from pages where id = $1 returning id", [id]);
  if (rows.length === 0) throw new HttpError(404, "Page introuvable.");
}
