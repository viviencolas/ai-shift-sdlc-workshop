import assert from "node:assert/strict";
import { test } from "node:test";

process.env.PGLITE_DIR = "memory://";
const { createPage, deletePage, getPage, listPages, updatePage } = await import("../src/server/pages.js");

test("la page d'exemple est créée par la migration", async () => {
  const pages = await listPages();
  assert.ok(pages.some((p) => p.title === "Plan de lancement"));
});

test("création d'une page avec titre et blocs", async () => {
  const page = await createPage({
    title: "  Ma page ",
    blocks: [
      { type: "heading", text: "Objectifs" },
      { type: "bullet", text: "Un point" },
    ],
  });
  assert.equal(page.title, "Ma page");
  assert.equal(page.blocks.length, 2);
  assert.ok(page.blocks.every((b) => b.id.length > 0));
  assert.deepEqual(await getPage(page.id), page);
});

test("une page exige un titre et des blocs valides", async () => {
  await assert.rejects(createPage({ title: "   " }), { status: 400 });
  await assert.rejects(createPage({ title: "Ok", blocks: [{ type: "inconnu", text: "x" }] }), { status: 400 });
});

test("modification du titre et des blocs", async () => {
  const page = await createPage({ title: "Brouillon" });
  const updated = await updatePage(page.id, { title: "Version finale", blocks: [{ type: "paragraph", text: "Bonjour" }] });
  assert.equal((await getPage(page.id)).title, "Version finale");
  assert.equal(updated.blocks[0]?.text, "Bonjour");
  assert.ok(updated.updatedAt >= page.updatedAt);
  await assert.rejects(updatePage("absente", { title: "x" }), { status: 404 });
});

test("suppression d'une page", async () => {
  const page = await createPage({ title: "À supprimer" });
  await deletePage(page.id);
  assert.ok(!(await listPages()).some((p) => p.id === page.id));
  await assert.rejects(deletePage(page.id), { status: 404 });
});
