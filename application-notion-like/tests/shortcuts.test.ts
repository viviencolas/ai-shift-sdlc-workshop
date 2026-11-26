import assert from "node:assert/strict";
import { test } from "node:test";
import type { Block } from "../src/shared/types.js";
import { convertBlock, detectShortcut, filterSlashItems, makeBlock, moveItem, numberedIndex, SLASH_ITEMS } from "../src/client/shortcuts.js";

test("le menu « / » propose les 12 types de blocs demandés", () => {
  assert.deepEqual(
    SLASH_ITEMS.map((i) => i.type),
    ["paragraph", "heading_1", "heading_2", "heading_3", "bulleted_list", "numbered_list", "todo", "toggle", "quote", "callout", "divider", "code"],
  );
});

test("le filtre du menu « / » ignore casse et accents", () => {
  assert.deepEqual(
    filterSlashItems("separateur").map((i) => i.type),
    ["divider"],
  );
  assert.ok(filterSlashItems("TITRE").every((i) => i.type.startsWith("heading")));
  assert.equal(filterSlashItems("").length, SLASH_ITEMS.length);
  assert.equal(filterSlashItems("zzz").length, 0);
});

test("raccourcis Markdown en début de ligne", () => {
  assert.deepEqual(detectShortcut("# Titre"), { type: "heading_1", rest: "Titre" });
  assert.deepEqual(detectShortcut("## "), { type: "heading_2", rest: "" });
  assert.deepEqual(detectShortcut("### x"), { type: "heading_3", rest: "x" });
  assert.deepEqual(detectShortcut("- "), { type: "bulleted_list", rest: "" });
  assert.deepEqual(detectShortcut("1. "), { type: "numbered_list", rest: "" });
  assert.deepEqual(detectShortcut("[] "), { type: "todo", rest: "" });
  assert.deepEqual(detectShortcut("> "), { type: "quote", rest: "" });
  assert.deepEqual(detectShortcut("---"), { type: "divider", rest: "" });
  assert.equal(detectShortcut("#titre"), null);
  assert.equal(detectShortcut("texte - simple"), null);
});

test("numérotation, conversion et déplacement de blocs", () => {
  const blocks: Block[] = [
    makeBlock("a", "numbered_list", "un"),
    makeBlock("b", "numbered_list", "deux"),
    makeBlock("c", "paragraph", "coupure"),
    makeBlock("d", "numbered_list", "un bis"),
  ];
  assert.deepEqual(
    [0, 1, 3].map((i) => numberedIndex(blocks, i)),
    [1, 2, 1],
  );
  const todo = convertBlock(blocks[0] as Block, "todo");
  assert.equal(todo.text, "un");
  assert.equal(todo.checked, false);
  assert.equal(convertBlock(todo, "divider").text, "");
  assert.deepEqual(
    moveItem(blocks, 3, 0).map((b) => b.id),
    ["d", "a", "b", "c"],
  );
});
