import assert from "node:assert/strict";
import { test } from "node:test";

process.env.PGLITE_DIR = "memory://";
const { createPage, deletePage, getPage, listPages, listTrash, updatePage } = await import("../src/server/pages.js");

test("les migrations créent les pages d'exemple avec icône et sous-page", async () => {
  const pages = await listPages();
  const welcome = pages.find((p) => p.id === "bienvenue");
  assert.equal(welcome?.icon, "👋");
  assert.equal(pages.find((p) => p.id === "raccourcis-clavier")?.parentId, "bienvenue");
  assert.equal(pages.find((p) => p.id === "plan-de-lancement")?.icon, "🚀");
  const plan = await getPage("plan-de-lancement");
  assert.ok(plan.blocks.every((b) => !["heading", "bullet"].includes(b.type)), "anciens types convertis");
});

test("création d'une page : titre vide permis, anciens types de blocs convertis", async () => {
  const page = await createPage({
    title: "  ",
    blocks: [
      { type: "heading", text: "Objectifs" },
      { type: "bullet", text: "Un point" },
      { type: "todo", text: "Tâche", checked: true },
      { type: "divider", text: "ignoré" },
    ],
  });
  assert.equal(page.title, "");
  assert.deepEqual(
    page.blocks.map((b) => b.type),
    ["heading_2", "bulleted_list", "todo", "divider"],
  );
  assert.equal(page.blocks[2]?.checked, true);
  assert.equal(page.blocks[3]?.text, "");
  assert.ok(page.blocks.every((b) => b.id.length > 0));
  assert.deepEqual(await getPage(page.id), page);
});

test("icône, couverture et blocs sont validés", async () => {
  await assert.rejects(createPage({ title: "Ok", blocks: [{ type: "inconnu", text: "x" }] }), { status: 400 });
  await assert.rejects(createPage({ title: "Ok", icon: "<b>" }), { status: 400 });
  await assert.rejects(createPage({ title: "Ok", cover: "rouge" }), { status: 400 });
  const page = await createPage({ title: "Décorée", icon: "🌱", cover: "forest" });
  assert.equal(page.icon, "🌱");
  assert.equal(page.cover, "forest");
  const cleared = await updatePage(page.id, { icon: null, cover: null });
  assert.equal(cleared.icon, null);
  assert.equal(cleared.cover, null);
});

test("sous-pages : parent obligatoire existant, positions croissantes", async () => {
  const parent = await createPage({ title: "Parent" });
  const a = await createPage({ title: "A", parentId: parent.id });
  const b = await createPage({ title: "B", parentId: parent.id });
  assert.equal(a.parentId, parent.id);
  assert.ok(b.position > a.position);
  await assert.rejects(createPage({ title: "Orpheline", parentId: "absente" }), { status: 400 });
});

test("corbeille : une page part avec ses sous-pages, puis revient", async () => {
  const parent = await createPage({ title: "Dossier" });
  const child = await createPage({ title: "Enfant", parentId: parent.id });
  const trashed = await updatePage(parent.id, { trashed: true });
  assert.ok(trashed.trashedAt);
  const active = await listPages();
  assert.ok(!active.some((p) => p.id === parent.id || p.id === child.id));
  const trash = await listTrash();
  assert.ok(trash.some((p) => p.id === parent.id));
  assert.ok(!trash.some((p) => p.id === child.id), "seule la racine supprimée est listée");
  await assert.rejects(createPage({ title: "x", parentId: parent.id }), { status: 400 });

  await updatePage(parent.id, { trashed: false });
  assert.equal((await getPage(child.id)).trashedAt, null);
  assert.ok((await listPages()).some((p) => p.id === child.id));
});

test("restaurer une sous-page dont le parent est dans la corbeille la remonte à la racine", async () => {
  const parent = await createPage({ title: "Parent supprimé" });
  const child = await createPage({ title: "Sous-page", parentId: parent.id });
  await updatePage(parent.id, { trashed: true });
  const restored = await updatePage(child.id, { trashed: false });
  assert.equal(restored.parentId, null);
  assert.equal(restored.trashedAt, null);
});

test("suppression définitive : seulement depuis la corbeille, avec les sous-pages", async () => {
  const page = await createPage({ title: "À supprimer" });
  const child = await createPage({ title: "Sous-page", parentId: page.id });
  await assert.rejects(deletePage(page.id), { status: 409 });
  await updatePage(page.id, { trashed: true });
  await deletePage(page.id);
  await assert.rejects(getPage(page.id), { status: 404 });
  await assert.rejects(getPage(child.id), { status: 404 });
  await assert.rejects(deletePage(page.id), { status: 404 });
});
