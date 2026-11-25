import type { Block, Database, Page, PageSummary } from "../shared/types.js";
import { createPage, deletePage, getPage, listPages, seedDatabase, updatePage } from "../shared/pages.js";

/** Les deux modes exposent la même interface ; le mode est choisi par <meta name="app-storage">. */
export interface Api {
  listPages(): Promise<PageSummary[]>;
  getPage(id: string): Promise<Page>;
  createPage(title: string, blocks?: Block[]): Promise<Page>;
  updatePage(id: string, title: string, blocks: Block[]): Promise<Page>;
  deletePage(id: string): Promise<void>;
}

async function request<T>(path: string, method = "GET", body?: unknown): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  if (response.status === 204) return undefined as T;
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? "Erreur inattendue.");
  return data;
}

const serverApi: Api = {
  listPages: () => request<PageSummary[]>("/pages"),
  getPage: (id) => request<Page>(`/pages/${id}`),
  createPage: (title, blocks = []) => request<Page>("/pages", "POST", { title, blocks }),
  updatePage: (id, title, blocks) => request<Page>(`/pages/${id}`, "PUT", { title, blocks }),
  deletePage: (id) => request<void>(`/pages/${id}`, "DELETE"),
};

const STORAGE_KEY = "notion-like-db";

function loadDatabase(): Database {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as Database) : null;
    if (parsed && Array.isArray(parsed.pages)) return parsed;
  } catch {
    // contenu illisible : on repart de la page d'exemple
  }
  const fresh = seedDatabase();
  saveDatabase(fresh);
  return fresh;
}

function saveDatabase(db: Database): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
}

/** Version statique : mêmes règles que le serveur (shared/pages.ts), données dans localStorage. */
const localApi: Api = {
  listPages: async () => listPages(loadDatabase()),
  getPage: async (id) => getPage(loadDatabase(), id),
  createPage: async (title, blocks = []) => {
    const db = loadDatabase();
    const page = createPage(db, { title, blocks });
    saveDatabase(db);
    return page;
  },
  updatePage: async (id, title, blocks) => {
    const db = loadDatabase();
    const page = updatePage(db, id, { title, blocks });
    saveDatabase(db);
    return page;
  },
  deletePage: async (id) => {
    const db = loadDatabase();
    deletePage(db, id);
    saveDatabase(db);
  },
};

const mode = document.querySelector<HTMLMetaElement>('meta[name="app-storage"]')?.content;
export const api: Api = mode === "local" ? localApi : serverApi;
