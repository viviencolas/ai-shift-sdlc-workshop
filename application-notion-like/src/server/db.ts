import { mkdir, readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import type { PGlite } from "@electric-sql/pglite";
import pg from "pg";

/**
 * Accès à la base : un seul point d'entrée, sql(texte, paramètres).
 * - DATABASE_URL défini (Vercel + Neon) : Postgres, schéma appliqué au build par scripts/migrate.mjs.
 * - Sinon (développement local, tests) : PGlite, un Postgres embarqué, stocké dans PGLITE_DIR
 *   (par défaut data/pglite ; "memory://" pour une base jetable), migrations appliquées au démarrage.
 * Toujours passer les valeurs en paramètres ($1, $2…), jamais par concaténation.
 */

const MIGRATIONS_DIR = "migrations";

let pool: pg.Pool | undefined;
let local: Promise<PGlite> | undefined;

export async function sql<T = Record<string, unknown>>(text: string, params: unknown[] = []): Promise<T[]> {
  const databaseUrl = process.env.DATABASE_URL?.trim() ?? "";
  if (databaseUrl !== "") {
    pool ??= new pg.Pool({ connectionString: databaseUrl, max: 3, idleTimeoutMillis: 10_000 });
    return (await pool.query(text, params)).rows as T[];
  }
  if (process.env.VERCEL) {
    throw new Error("DATABASE_URL manquant : ajoutez l'intégration Neon au projet Vercel.");
  }
  local ??= startLocal().catch((error: unknown) => {
    local = undefined;
    throw error;
  });
  return (await (await local).query<T>(text, params)).rows;
}

async function startLocal(): Promise<PGlite> {
  const dir = process.env.PGLITE_DIR ?? join("data", "pglite");
  if (!dir.startsWith("memory://")) await mkdir(dir, { recursive: true });
  const { PGlite } = await import("@electric-sql/pglite");
  const db = new PGlite(dir);
  await db.exec(
    "create table if not exists schema_migrations (name text primary key, applied_at timestamptz not null default now())",
  );
  const done = new Set((await db.query<{ name: string }>("select name from schema_migrations")).rows.map((r) => r.name));
  const files = (await readdir(MIGRATIONS_DIR)).filter((f) => f.endsWith(".sql")).sort();
  for (const file of files.filter((f) => !done.has(f))) {
    await db.exec(await readFile(join(MIGRATIONS_DIR, file), "utf8"));
    await db.query("insert into schema_migrations (name) values ($1)", [file]);
  }
  return db;
}
