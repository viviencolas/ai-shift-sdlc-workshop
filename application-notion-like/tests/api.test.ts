import assert from "node:assert/strict";
import { mkdtempSync, rmSync } from "node:fs";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { after, before, test } from "node:test";
import { createApp } from "../src/server/app.js";
import { JsonStore } from "../src/server/storage.js";
import type { Page, Thread } from "../src/shared/types.js";

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

async function call<T>(user: string, method: string, path: string, body?: unknown): Promise<{ status: number; data: T }> {
  const res = await fetch(`${base}/api${path}`, {
    method,
    headers: { "content-type": "application/json", "x-user": user },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  return { status: res.status, data: (await res.json()) as T };
}

test("parcours : créer une page, commenter, répondre, résoudre", async () => {
  const created = await call<Page>("lea", "POST", "/pages", {
    title: "Page de test",
    blocks: [{ type: "paragraph", text: "Bonjour" }],
  });
  assert.equal(created.status, 201);
  const pageId = created.data.id;

  const comment = await call<Thread>("lea", "POST", `/pages/${pageId}/threads`, { text: "Premier commentaire" });
  assert.equal(comment.status, 201);

  const reply = await call<Thread>("hugo", "POST", `/pages/${pageId}/threads/${comment.data.id}/replies`, { text: "Réponse" });
  assert.equal(reply.status, 201);

  const forbidden = await call<{ error: string }>("sami", "POST", `/pages/${pageId}/threads/${comment.data.id}/resolve`);
  assert.equal(forbidden.status, 403);

  const resolved = await call<Thread>("lea", "POST", `/pages/${pageId}/threads/${comment.data.id}/resolve`);
  assert.equal(resolved.data.status, "resolved");

  const page = await call<Page>("sami", "GET", `/pages/${pageId}`);
  const thread = page.data.threads[0];
  assert.deepEqual(thread?.comments.map((c) => c.authorName), ["Léa", "Hugo"]);
});

test("l'API refuse un utilisateur inconnu et une page absente", async () => {
  assert.equal((await call("inconnu", "POST", "/pages", { title: "x" })).status, 401);
  assert.equal((await call("lea", "GET", "/pages/nope")).status, 404);
});
