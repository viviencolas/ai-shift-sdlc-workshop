import type { Block, CoverKey, Page, PageSummary } from "../shared/types.js";

export interface PagePatch {
  title?: string;
  blocks?: Block[];
  icon?: string | null;
  cover?: CoverKey | null;
  trashed?: boolean;
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

export const api = {
  listPages: () => request<PageSummary[]>("/pages"),
  listTrash: () => request<PageSummary[]>("/pages?trashed=1"),
  getPage: (id: string) => request<Page>(`/pages/${encodeURIComponent(id)}`),
  createPage: (input: PagePatch & { parentId?: string | null }) => request<Page>("/pages", "POST", input),
  updatePage: (id: string, patch: PagePatch) => request<Page>(`/pages/${encodeURIComponent(id)}`, "PUT", patch),
  deletePage: (id: string) => request<void>(`/pages/${encodeURIComponent(id)}`, "DELETE"),
};
