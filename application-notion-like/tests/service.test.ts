import assert from "node:assert/strict";
import { test } from "node:test";
import type { Database } from "../src/shared/types.js";
import {
  addComment,
  addReply,
  createPage,
  findUser,
  HttpError,
  reopenThread,
  resolveThread,
  updatePage,
} from "../src/server/service.js";

const lea = findUser("lea");
const hugo = findUser("hugo");
const sami = findUser("sami");
const newDb = (): Database => ({ pages: [] });

test("création d'une page avec titre et blocs", () => {
  const db = newDb();
  const page = createPage(db, lea, {
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

test("une page exige un titre et un éditeur", () => {
  const db = newDb();
  assert.throws(() => createPage(db, lea, { title: "   " }), { status: 400 });
  assert.throws(() => createPage(db, sami, { title: "Interdit" }), { status: 403 });
  const page = createPage(db, lea, { title: "Ok" });
  assert.throws(() => updatePage(db, sami, page.id, { title: "Modifié" }), { status: 403 });
});

test("ajout d'un commentaire avec auteur et date", () => {
  const db = newDb();
  const page = createPage(db, lea, { title: "Plan", blocks: [{ type: "paragraph", text: "Texte" }] });
  const thread = addComment(db, lea, page.id, { text: "Une remarque" });
  assert.equal(thread.status, "open");
  assert.equal(thread.comments.length, 1);
  const [comment] = thread.comments;
  assert.equal(comment?.authorName, "Léa");
  assert.ok(!Number.isNaN(Date.parse(comment?.createdAt ?? "")));
  assert.throws(() => addComment(db, lea, page.id, { text: " " }), { status: 400 });
});

test("une réponse apparaît dans le même fil, un lecteur seul peut répondre", () => {
  const db = newDb();
  const page = createPage(db, lea, { title: "Plan" });
  const thread = addComment(db, lea, page.id, { text: "Question" });
  addReply(db, hugo, page.id, thread.id, { text: "Réponse" });
  addReply(db, sami, page.id, thread.id, { text: "Lecture seule" });
  assert.equal(page.threads.length, 1);
  assert.deepEqual(
    thread.comments.map((c) => c.authorName),
    ["Léa", "Hugo", "Sami"],
  );
});

test("résolution : refusée au lecteur seul, rouverte par une nouvelle réponse", () => {
  const db = newDb();
  const page = createPage(db, lea, { title: "Plan" });
  const thread = addComment(db, lea, page.id, { text: "Question" });
  addReply(db, hugo, page.id, thread.id, { text: "Réponse" });
  assert.throws(() => resolveThread(db, sami, page.id, thread.id), (e) => e instanceof HttpError && e.status === 403);
  resolveThread(db, lea, page.id, thread.id);
  assert.equal(thread.status, "resolved");
  addReply(db, hugo, page.id, thread.id, { text: "Encore une chose" });
  assert.equal(thread.status, "open");
  resolveThread(db, lea, page.id, thread.id);
  reopenThread(db, hugo, page.id, thread.id);
  assert.equal(thread.status, "open");
});

test("un commentaire sur un passage conserve un extrait", () => {
  const db = newDb();
  const page = createPage(db, lea, { title: "Plan", blocks: [{ type: "paragraph", text: "Date à préciser" }] });
  const blockId = page.blocks[0]?.id;
  const thread = addComment(db, hugo, page.id, { text: "Quelle date ?", blockId });
  assert.equal(thread.blockId, blockId);
  assert.equal(thread.quote, "Date à préciser");
  assert.throws(() => addComment(db, hugo, page.id, { text: "x", blockId: "inconnu" }), { status: 400 });
});
