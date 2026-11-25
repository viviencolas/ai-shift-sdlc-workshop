import { randomUUID } from "node:crypto";
import type { Block, BlockType, Database, Page, PageSummary, Thread, User } from "../shared/types.js";

export const USERS: readonly User[] = [
  { id: "lea", name: "Léa", role: "editor" },
  { id: "hugo", name: "Hugo", role: "editor" },
  { id: "sami", name: "Sami", role: "reader" },
];

const BLOCK_TYPES: readonly BlockType[] = ["heading", "paragraph", "bullet"];
const MAX_TITLE = 200;
const MAX_BLOCK_TEXT = 5000;
const MAX_COMMENT = 2000;
const MAX_BLOCKS = 500;

export class HttpError extends Error {
  constructor(
    readonly status: number,
    message: string,
  ) {
    super(message);
  }
}

export function findUser(id: string | undefined): User {
  const user = USERS.find((u) => u.id === id);
  if (!user) throw new HttpError(401, "Utilisateur inconnu.");
  return user;
}

function requireEditor(user: User): void {
  if (user.role !== "editor") {
    throw new HttpError(403, "Un lecteur seul ne peut pas créer ou modifier une page.");
  }
}

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

function findThread(page: Page, threadId: string): Thread {
  const thread = page.threads.find((t) => t.id === threadId);
  if (!thread) throw new HttpError(404, "Fil de commentaires introuvable.");
  return thread;
}

export function listPages(db: Database): PageSummary[] {
  return db.pages
    .map((p) => ({
      id: p.id,
      title: p.title,
      updatedAt: p.updatedAt,
      openThreads: p.threads.filter((t) => t.status === "open").length,
    }))
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getPage(db: Database, pageId: string): Page {
  return findPage(db, pageId);
}

export function createPage(db: Database, user: User, input: { title?: unknown; blocks?: unknown }): Page {
  requireEditor(user);
  const now = new Date().toISOString();
  const page: Page = {
    id: randomUUID(),
    title: cleanText(input.title, "Titre", MAX_TITLE),
    blocks: input.blocks === undefined ? [] : cleanBlocks(input.blocks),
    threads: [],
    createdAt: now,
    updatedAt: now,
  };
  db.pages.push(page);
  return page;
}

export function updatePage(
  db: Database,
  user: User,
  pageId: string,
  input: { title?: unknown; blocks?: unknown },
): Page {
  requireEditor(user);
  const page = findPage(db, pageId);
  if (input.title !== undefined) page.title = cleanText(input.title, "Titre", MAX_TITLE);
  if (input.blocks !== undefined) page.blocks = cleanBlocks(input.blocks);
  page.updatedAt = new Date().toISOString();
  return page;
}

/** Tout utilisateur ayant accès à la page, y compris un lecteur seul, peut commenter. */
export function addComment(
  db: Database,
  user: User,
  pageId: string,
  input: { text?: unknown; blockId?: unknown },
): Thread {
  const page = findPage(db, pageId);
  const text = cleanText(input.text, "Commentaire", MAX_COMMENT);
  let blockId: string | null = null;
  let quote: string | null = null;
  if (input.blockId !== undefined && input.blockId !== null) {
    const block = page.blocks.find((b) => b.id === input.blockId);
    if (!block) throw new HttpError(400, "Passage introuvable sur cette page.");
    blockId = block.id;
    quote = block.text.slice(0, 120);
  }
  const thread: Thread = {
    id: randomUUID(),
    pageId: page.id,
    blockId,
    quote,
    status: "open",
    resolvedBy: null,
    resolvedAt: null,
    comments: [
      {
        id: randomUUID(),
        authorId: user.id,
        authorName: user.name,
        text,
        createdAt: new Date().toISOString(),
      },
    ],
  };
  page.threads.push(thread);
  return thread;
}

/** Une réponse apparaît dans le même fil ; sur un fil résolu, elle le rouvre. */
export function addReply(db: Database, user: User, pageId: string, threadId: string, input: { text?: unknown }): Thread {
  const thread = findThread(findPage(db, pageId), threadId);
  const text = cleanText(input.text, "Réponse", MAX_COMMENT);
  thread.comments.push({
    id: randomUUID(),
    authorId: user.id,
    authorName: user.name,
    text,
    createdAt: new Date().toISOString(),
  });
  thread.status = "open";
  thread.resolvedBy = null;
  thread.resolvedAt = null;
  return thread;
}

/** Un lecteur seul répond mais ne résout pas (décision PO du kit). */
export function resolveThread(db: Database, user: User, pageId: string, threadId: string): Thread {
  if (user.role !== "editor") throw new HttpError(403, "Un lecteur seul ne peut pas résoudre un fil.");
  const thread = findThread(findPage(db, pageId), threadId);
  if (thread.status === "resolved") throw new HttpError(409, "Ce fil est déjà résolu.");
  thread.status = "resolved";
  thread.resolvedBy = user.name;
  thread.resolvedAt = new Date().toISOString();
  return thread;
}

export function reopenThread(db: Database, user: User, pageId: string, threadId: string): Thread {
  if (user.role !== "editor") throw new HttpError(403, "Un lecteur seul ne peut pas rouvrir un fil.");
  const thread = findThread(findPage(db, pageId), threadId);
  if (thread.status === "open") throw new HttpError(409, "Ce fil est déjà ouvert.");
  thread.status = "open";
  thread.resolvedBy = null;
  thread.resolvedAt = null;
  return thread;
}

export function seedDatabase(): Database {
  const db: Database = { pages: [] };
  const lea = USERS[0] as User;
  const hugo = USERS[1] as User;
  const page = createPage(db, lea, {
    title: "Plan de lancement",
    blocks: [
      { type: "heading", text: "Objectifs" },
      { type: "paragraph", text: "Lancer la première version auprès des équipes pilotes." },
      { type: "bullet", text: "Pages avec blocs simples" },
      { type: "bullet", text: "Commentaires en fil sur chaque page" },
    ],
  });
  const thread = addComment(db, lea, page.id, {
    text: "Peut-on préciser la date de lancement ?",
    blockId: page.blocks[1]?.id,
  });
  addReply(db, hugo, page.id, thread.id, { text: "Oui, je l'ajoute après la revue de jeudi." });
  return db;
}
