import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { createApp } from "../src/server/app.js";
import { JsonStore } from "../src/server/storage.js";
import type { Page, PageSummary } from "../src/shared/types.js";

let base = "";
let dir = "";
let server: ReturnType<typeof createApp>;

before(async () => {
  dir = mkdtempSync(join(tmpdir(), "notion-like-"));
  server = createApp(new JsonStore(join(dir, "db.json")), join(dir, "public"));
  await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

after(() => {
  server.close();
  rmSync(dir, { recursive: true, force: true });
});

async function call<T>(method: string, path: string, body?: unknown): Promise<{ status: number; data: T }> {
  const res = await fetch(`${base}/api${path}`, {
    method,
    headers: { "content-type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  return { status: res.status, data: (text ? JSON.parse(text) : undefined) as T };
}

test("parcours : créer, lire, modifier, supprimer une page", async () => {
  const created = await call<Page>("POST", "/pages", { title: "Page de test", blocks: [{ type: "paragraph", text: "Bonjour" }] });
  assert.equal(created.status, 201);
  const id = created.data.id;

  const read = await call<Page>("GET", `/pages/${id}`);
  assert.equal(read.data.blocks[0]?.text, "Bonjour");

  const updated = await call<Page>("PUT", `/pages/${id}`, { title: "Titre modifié" });
  assert.equal(updated.data.title, "Titre modifié");

  const list = await call<PageSummary[]>("GET", "/pages");
  assert.ok(list.data.some((p) => p.id === id));

  assert.equal((await call("DELETE", `/pages/${id}`)).status, 204);
  assert.equal((await call("GET", `/pages/${id}`)).status, 404);
});

test("l'API refuse un titre vide et une route inconnue", async () => {
  assert.equal((await call("POST", "/pages", { title: "" })).status, 400);
  assert.equal((await call("GET", "/inconnu")).status, 404);
});
