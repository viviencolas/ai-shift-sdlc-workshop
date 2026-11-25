import assert from "node:assert/strict";
import { test } from "node:test";
import type { Database } from "../src/shared/types.js";
import { createPage, deletePage, getPage, listPages, seedDatabase, updatePage } from "../src/shared/pages.js";

const newDb = (): Database => ({ pages: [] });

test("création d'une page avec titre et blocs", () => {
  const db = newDb();
  const page = createPage(db, {
    title: "  Plan de lancement ",
    blocks: [
      { type: "heading", text: "Objectifs" },
      { type: "bullet", text: "Un point" },
    ],
  });
  assert.equal(db.pages.length, 1);
  assert.equal(page.title, "Plan de lancement");
  assert.equal(page.blocks.length, 2);
  assert.ok(page.blocks.every((b) => b.id.length > 0));
});

test("une page exige un titre et des blocs valides", () => {
  const db = newDb();
  assert.throws(() => createPage(db, { title: "   " }), { status: 400 });
  assert.throws(() => createPage(db, { title: "Ok", blocks: [{ type: "inconnu", text: "x" }] }), { status: 400 });
  assert.equal(db.pages.length, 0);
});

test("modification du titre et des blocs", () => {
  const db = newDb();
  const page = createPage(db, { title: "Brouillon" });
  const updated = updatePage(db, page.id, { title: "Version finale", blocks: [{ type: "paragraph", text: "Bonjour" }] });
  assert.equal(getPage(db, page.id).title, "Version finale");
  assert.equal(updated.blocks[0]?.text, "Bonjour");
  assert.throws(() => updatePage(db, "absente", { title: "x" }), { status: 404 });
});

test("suppression d'une page et liste des pages", () => {
  const db = seedDatabase();
  const extra = createPage(db, { title: "À supprimer" });
  assert.equal(listPages(db).length, 2);
  deletePage(db, extra.id);
  assert.deepEqual(
    listPages(db).map((p) => p.title),
    ["Plan de lancement"],
  );
  assert.throws(() => deletePage(db, extra.id), { status: 404 });
});
