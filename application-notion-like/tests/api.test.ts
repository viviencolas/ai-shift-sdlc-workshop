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

test("parcours : page, sous-page, modification, corbeille, restauration, suppression", async () => {
  const created = await call<Page>("POST", "/api/pages", { title: "Page de test", icon: "📘", blocks: [{ type: "paragraph", text: "Bonjour" }] });
  assert.equal(created.status, 201);
  const id = created.data.id;
  const sub = await call<Page>("POST", "/api/pages", { title: "Sous-page", parentId: id });
  assert.equal(sub.status, 201);
  assert.equal(sub.data.parentId, id);

  assert.equal((await call<Page>("GET", `/api/pages/${id}`)).data.blocks[0]?.text, "Bonjour");

  const updated = await call<Page>("PUT", `/api/pages/${id}`, {
    title: "Titre modifié",
    cover: "ocean",
    blocks: [
      { id: "b2", type: "heading_1", text: "Titre" },
      { id: "b1", type: "paragraph", text: "Bonjour" },
    ],
  });
  assert.equal(updated.data.title, "Titre modifié");
  assert.equal(updated.data.cover, "ocean");
  assert.deepEqual(
    updated.data.blocks.map((b) => b.id),
    ["b2", "b1"],
  );

  const list = await call<PageSummary[]>("GET", "/api/pages");
  assert.ok(list.data.some((p) => p.id === id && p.title === "Titre modifié" && p.icon === "📘"));

  assert.equal((await call("DELETE", `/api/pages/${id}`)).status, 409);
  assert.equal((await call<Page>("PUT", `/api/pages/${id}`, { trashed: true })).status, 200);
  const trash = await call<PageSummary[]>("GET", "/api/pages?trashed=1");
  assert.ok(trash.data.some((p) => p.id === id));
  assert.ok(!(await call<PageSummary[]>("GET", "/api/pages")).data.some((p) => p.id === sub.data.id));

  assert.equal((await call<Page>("PUT", `/api/pages/${id}`, { trashed: false })).data.trashedAt, null);
  await call("PUT", `/api/pages/${id}`, { trashed: true });
  assert.equal((await call("DELETE", `/api/pages/${id}`)).status, 204);
  assert.equal((await call("GET", `/api/pages/${id}`)).status, 404);
  assert.equal((await call("GET", `/api/pages/${sub.data.id}`)).status, 404);
});

test("l'API refuse un bloc inconnu, un JSON invalide et une route inconnue", async () => {
  assert.equal((await call("POST", "/api/pages", { title: "x", blocks: [{ type: "image", text: "" }] })).status, 400);
  const bad = await handle(new Request("http://test.local/api/pages", { method: "POST", body: "{pas du json" }));
  assert.equal(bad.status, 400);
  assert.equal((await call("GET", "/api/inconnu")).status, 404);
});
