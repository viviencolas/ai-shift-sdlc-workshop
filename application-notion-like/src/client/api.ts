import type { Block, Page, PageSummary } from "../shared/types.js";

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
  getPage: (id: string) => request<Page>(`/pages/${id}`),
  createPage: (title: string, blocks: Block[] = []) => request<Page>("/pages", "POST", { title, blocks }),
  updatePage: (id: string, title: string, blocks: Block[]) => request<Page>(`/pages/${id}`, "PUT", { title, blocks }),
  deletePage: (id: string) => request<void>(`/pages/${id}`, "DELETE"),
};
