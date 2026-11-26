import type { Block, BlockType } from "../shared/types.js";
import type { IconName } from "./icons.js";

/** Règles pures de l'éditeur (sans DOM) : raccourcis Markdown, menu « / », numérotation. Testées dans tests/. */

export interface SlashItem {
  type: BlockType;
  label: string;
  description: string;
  icon: IconName;
  keywords: string[];
}

export const SLASH_ITEMS: readonly SlashItem[] = [
  { type: "paragraph", label: "Texte", description: "Commencez à écrire du texte simple.", icon: "text", keywords: ["texte", "paragraphe", "text"] },
  { type: "heading_1", label: "Titre 1", description: "Grand titre de section.", icon: "h1", keywords: ["titre", "h1", "heading"] },
  { type: "heading_2", label: "Titre 2", description: "Titre de section moyen.", icon: "h2", keywords: ["titre", "h2", "heading"] },
  { type: "heading_3", label: "Titre 3", description: "Petit titre de section.", icon: "h3", keywords: ["titre", "h3", "heading"] },
  { type: "bulleted_list", label: "Liste à puces", description: "Une liste simple à puces.", icon: "list", keywords: ["liste", "puces", "bullet"] },
  { type: "numbered_list", label: "Liste numérotée", description: "Une liste avec numérotation.", icon: "listOrdered", keywords: ["liste", "numérotée", "numero", "numbered"] },
  { type: "todo", label: "Case à cocher", description: "Suivez les tâches avec une liste de tâches.", icon: "todo", keywords: ["case", "tâche", "todo", "cocher"] },
  { type: "toggle", label: "Bascule", description: "Contenu masqué que l'on déplie.", icon: "toggle", keywords: ["bascule", "toggle", "replier"] },
  { type: "quote", label: "Citation", description: "Mettez une citation en valeur.", icon: "quote", keywords: ["citation", "quote"] },
  { type: "callout", label: "Encadré", description: "Faites ressortir un texte.", icon: "callout", keywords: ["encadré", "callout", "note"] },
  { type: "divider", label: "Séparateur", description: "Séparez visuellement les blocs.", icon: "divider", keywords: ["séparateur", "ligne", "divider"] },
  { type: "code", label: "Code", description: "Un extrait de code.", icon: "code", keywords: ["code", "extrait"] },
];

const normalize = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

export function filterSlashItems(query: string): SlashItem[] {
  const q = normalize(query.trim());
  if (q === "") return [...SLASH_ITEMS];
  return SLASH_ITEMS.filter((item) => [item.label, ...item.keywords].some((word) => normalize(word).includes(q)));
}

const MARKDOWN: readonly [RegExp, BlockType][] = [
  [/^### /, "heading_3"],
  [/^## /, "heading_2"],
  [/^# /, "heading_1"],
  [/^[-*] /, "bulleted_list"],
  [/^1[.)] /, "numbered_list"],
  [/^\[ ?\] /, "todo"],
  [/^> /, "quote"],
  [/^``` ?/, "code"],
];

/** Raccourci Markdown en début de paragraphe : « # » + espace, « - » + espace, « [] » + espace… */
export function detectShortcut(text: string): { type: BlockType; rest: string } | null {
  if (text === "---") return { type: "divider", rest: "" };
  for (const [pattern, type] of MARKDOWN) {
    const match = pattern.exec(text);
    if (match && (type !== "code" || text.startsWith("``` ") || text === "```")) {
      return { type, rest: text.slice(match[0].length) };
    }
  }
  return null;
}

/** Numéro affiché d'un élément de liste numérotée : position dans la suite d'éléments consécutifs. */
export function numberedIndex(blocks: readonly Block[], index: number): number {
  let n = 1;
  for (let i = index - 1; i >= 0 && blocks[i]?.type === "numbered_list"; i--) n++;
  return n;
}

/** Types qui se prolongent avec Entrée (une nouvelle ligne garde le même type). */
export const CONTINUING_TYPES: readonly BlockType[] = ["bulleted_list", "numbered_list", "todo"];

export function makeBlock(id: string, type: BlockType, text = ""): Block {
  const block: Block = { id, type, text: type === "divider" ? "" : text };
  if (type === "todo") block.checked = false;
  if (type === "toggle") block.body = "";
  if (type === "callout") block.icon = "💡";
  return block;
}

/** Change le type d'un bloc en gardant son texte et en (ré)initialisant les champs propres au type. */
export function convertBlock(block: Block, type: BlockType): Block {
  const next = makeBlock(block.id, type, block.text);
  if (type === "todo" && block.type === "todo") next.checked = block.checked === true;
  if (type === "toggle" && block.body) next.body = block.body;
  if (type === "callout" && block.icon) next.icon = block.icon;
  return next;
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  const copy = [...items];
  const [item] = copy.splice(from, 1);
  if (item === undefined) return copy;
  copy.splice(Math.max(0, Math.min(to, copy.length)), 0, item);
  return copy;
}
