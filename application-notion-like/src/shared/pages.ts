import type { Block, BlockType, Database, Page, PageSummary } from "./types.js";
import { HttpError } from "./errors.js";

/**
 * Modèle de page : règles métier et validation, sans HTTP, fichier ni API Node :
 * le même code tourne dans le serveur et dans la version statique (navigateur).
 * Chaque fonction reçoit la base en mémoire ; la persistance est faite par l'appelant (voir app.ts).
 */

function randomUUID(): string {
  const c = globalThis.crypto;
  if (typeof c.randomUUID === "function") return c.randomUUID();
  const bytes = c.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
}

const BLOCK_TYPES: readonly BlockType[] = ["heading", "paragraph", "bullet"];
const MAX_TITLE = 200;
const MAX_BLOCK_TEXT = 5000;
const MAX_BLOCKS = 500;

function cleanText(value: unknown, label: string, max: number, allowEmpty = false): string {
  if (typeof value !== "string") throw new HttpError(400, `${label} : texte attendu.`);
  const text = value.trim();
  if (!allowEmpty && text.length === 0) throw new HttpError(400, `${label} : ne peut pas être vide.`);
  if (text.length > max) throw new HttpError(400, `${label} : ${max} caractères maximum.`);
  return text;
}

function cleanBlocks(value: unknown): Block[] {
  if (!Array.isArray(value)) throw new HttpError(400, "Blocs : liste attendue.");
  if (value.length > MAX_BLOCKS) throw new HttpError(400, `Blocs : ${MAX_BLOCKS} maximum.`);
  return value.map((raw: unknown) => {
    const item = (raw ?? {}) as Record<string, unknown>;
    if (!BLOCK_TYPES.includes(item.type as BlockType)) throw new HttpError(400, "Bloc : type inconnu.");
    return {
      id: typeof item.id === "string" && item.id.length > 0 ? item.id.slice(0, 64) : randomUUID(),
      type: item.type as BlockType,
      text: cleanText(item.text ?? "", "Bloc", MAX_BLOCK_TEXT, true),
    };
  });
}

function findPage(db: Database, pageId: string): Page {
  const page = db.pages.find((p) => p.id === pageId);
  if (!page) throw new HttpError(404, "Page introuvable.");
  return page;
}

export function listPages(db: Database): PageSummary[] {
  return db.pages
    .map((p) => ({ id: p.id, title: p.title, updatedAt: p.updatedAt }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getPage(db: Database, pageId: string): Page {
  return findPage(db, pageId);
}

export function createPage(db: Database, input: { title?: unknown; blocks?: unknown }): Page {
  const now = new Date().toISOString();
  const page: Page = {
    id: randomUUID(),
    title: cleanText(input.title, "Titre", MAX_TITLE),
    blocks: input.blocks === undefined ? [] : cleanBlocks(input.blocks),
    createdAt: now,
    updatedAt: now,
  };
  db.pages.push(page);
  return page;
}

export function updatePage(db: Database, pageId: string, input: { title?: unknown; blocks?: unknown }): Page {
  const page = findPage(db, pageId);
  if (input.title !== undefined) page.title = cleanText(input.title, "Titre", MAX_TITLE);
  if (input.blocks !== undefined) page.blocks = cleanBlocks(input.blocks);
  page.updatedAt = new Date().toISOString();
  return page;
}

export function deletePage(db: Database, pageId: string): void {
  const page = findPage(db, pageId);
  db.pages.splice(db.pages.indexOf(page), 1);
}

export function seedDatabase(): Database {
  const db: Database = { pages: [] };
  createPage(db, {
    title: "Plan de lancement",
    blocks: [
      { type: "heading", text: "Objectifs" },
      { type: "paragraph", text: "Lancer la première version auprès des équipes pilotes." },
      { type: "bullet", text: "Pages avec blocs simples" },
      { type: "bullet", text: "Création, édition et suppression de pages" },
    ],
  });
  return db;
}
