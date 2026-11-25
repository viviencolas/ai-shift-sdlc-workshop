import type { Block, BlockType } from "./types.js";

/** Validation des entrées d'une page : pure, sans base ni HTTP. Lève ValidationError (message en français). */

export class ValidationError extends Error {}

const BLOCK_TYPES: readonly BlockType[] = ["heading", "paragraph", "bullet"];
export const MAX_TITLE = 200;
export const MAX_BLOCK_TEXT = 5000;
export const MAX_BLOCKS = 500;

function cleanText(value: unknown, label: string, max: number, allowEmpty = false): string {
  if (typeof value !== "string") throw new ValidationError(`${label} : texte attendu.`);
  const text = value.trim();
  if (!allowEmpty && text.length === 0) throw new ValidationError(`${label} : ne peut pas être vide.`);
  if (text.length > max) throw new ValidationError(`${label} : ${max} caractères maximum.`);
  return text;
}

export const cleanTitle = (value: unknown): string => cleanText(value, "Titre", MAX_TITLE);

export function cleanBlocks(value: unknown, newId: () => string): Block[] {
  if (!Array.isArray(value)) throw new ValidationError("Blocs : liste attendue.");
  if (value.length > MAX_BLOCKS) throw new ValidationError(`Blocs : ${MAX_BLOCKS} maximum.`);
  return value.map((raw: unknown) => {
    const item = (raw ?? {}) as Record<string, unknown>;
    if (!BLOCK_TYPES.includes(item.type as BlockType)) throw new ValidationError("Bloc : type inconnu.");
    return {
      id: typeof item.id === "string" && item.id.length > 0 ? item.id.slice(0, 64) : newId(),
      type: item.type as BlockType,
      text: cleanText(item.text ?? "", "Bloc", MAX_BLOCK_TEXT, true),
    };
  });
}
