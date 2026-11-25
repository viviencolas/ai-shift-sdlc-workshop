import assert from "node:assert/strict";
import { test } from "node:test";
import type { Page, PageSummary } from "../src/shared/types.js";

process.env.PGLITE_DIR = "memory://";
const { handle } = await import("../src/server/handler.js");

async function call<T>(method: string, path: string, body?: unknown): Promise<{ status: number; data: T }> {
  const response = await handle(
    new Request(`http://test.local${path}`, {
      method,
      headers: { "content-type": "application/json" },
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  );
  const text = await response.text();
  return { status: response.status, data: (text ? JSON.parse(text) : undefined) as T };
}

test("parcours : créer, lire, modifier, supprimer une page", async () => {
  const created = await call<Page>("POST", "/api/pages", { title: "Page de test", blocks: [{ type: "paragraph", text: "Bonjour" }] });
  assert.equal(created.status, 201);
  const id = created.data.id;

  assert.equal((await call<Page>("GET", `/api/pages/${id}`)).data.blocks[0]?.text, "Bonjour");

  const updated = await call<Page>("PUT", `/api/pages/${id}`, { title: "Titre modifié" });
  assert.equal(updated.data.title, "Titre modifié");
  assert.equal(updated.data.blocks.length, 1);

  const list = await call<PageSummary[]>("GET", "/api/pages");
  assert.ok(list.data.some((p) => p.id === id && p.title === "Titre modifié"));

  assert.equal((await call("DELETE", `/api/pages/${id}`)).status, 204);
  assert.equal((await call("GET", `/api/pages/${id}`)).status, 404);
});

test("l'API refuse un titre vide, un JSON invalide et une route inconnue", async () => {
  assert.equal((await call("POST", "/api/pages", { title: "" })).status, 400);
  const bad = await handle(new Request("http://test.local/api/pages", { method: "POST", body: "{pas du json" }));
  assert.equal(bad.status, 400);
  assert.equal((await call("GET", "/api/inconnu")).status, 404);
});
