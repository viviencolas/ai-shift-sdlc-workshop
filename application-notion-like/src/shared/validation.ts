import type { Block, BlockType, CoverKey } from "./types.js";

/** Validation des entrées d'une page : pure, sans base ni HTTP. Lève ValidationError (message en français). */

export class ValidationError extends Error {}

export const BLOCK_TYPES: readonly BlockType[] = [
  "paragraph",
  "heading_1",
  "heading_2",
  "heading_3",
  "bulleted_list",
  "numbered_list",
  "todo",
  "toggle",
  "quote",
  "callout",
  "divider",
  "code",
];
/** Anciens noms de types (avant la migration 003). */
const LEGACY_TYPES: Record<string, BlockType> = { heading: "heading_2", bullet: "bulleted_list" };
export const COVERS: readonly CoverKey[] = ["sunset", "ocean", "forest", "dusk", "sand", "slate"];

export const MAX_TITLE = 200;
export const MAX_BLOCK_TEXT = 10000;
export const MAX_BLOCKS = 1000;
const MAX_ICON = 16;

function cleanText(value: unknown, label: string, max: number): string {
  if (typeof value !== "string") throw new ValidationError(`${label} : texte attendu.`);
  if (value.length > max) throw new ValidationError(`${label} : ${max} caractères maximum.`);
  return value;
}

/** Titre : peut être vide (affiché « Sans titre »). */
export const cleanTitle = (value: unknown): string => cleanText(value, "Titre", MAX_TITLE).trim();

export function cleanIcon(value: unknown): string | null {
  if (value === null || value === "") return null;
  const icon = cleanText(value, "Icône", MAX_ICON).trim();
  if (/[<>]/.test(icon)) throw new ValidationError("Icône : emoji attendu.");
  return icon || null;
}

export function cleanCover(value: unknown): CoverKey | null {
  if (value === null || value === "") return null;
  if (!COVERS.includes(value as CoverKey)) throw new ValidationError("Couverture : valeur inconnue.");
  return value as CoverKey;
}

export function cleanBlockType(value: unknown): BlockType {
  const type = typeof value === "string" ? (LEGACY_TYPES[value] ?? value) : value;
  if (!BLOCK_TYPES.includes(type as BlockType)) throw new ValidationError("Bloc : type inconnu.");
  return type as BlockType;
}

export function cleanBlocks(value: unknown, newId: () => string): Block[] {
  if (!Array.isArray(value)) throw new ValidationError("Blocs : liste attendue.");
  if (value.length > MAX_BLOCKS) throw new ValidationError(`Blocs : ${MAX_BLOCKS} maximum.`);
  return value.map((raw: unknown) => {
    const item = (raw ?? {}) as Record<string, unknown>;
    const type = cleanBlockType(item.type);
    const block: Block = {
      id: typeof item.id === "string" && item.id.length > 0 ? item.id.slice(0, 64) : newId(),
      type,
      text: type === "divider" ? "" : cleanText(item.text ?? "", "Bloc", MAX_BLOCK_TEXT),
    };
    if (type === "todo") block.checked = item.checked === true;
    if (type === "toggle") block.body = cleanText(item.body ?? "", "Bascule", MAX_BLOCK_TEXT);
    if (type === "callout") block.icon = cleanIcon(item.icon ?? null) ?? "💡";
    return block;
  });
}
