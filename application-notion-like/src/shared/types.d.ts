export type BlockType =
  | "paragraph"
  | "heading_1"
  | "heading_2"
  | "heading_3"
  | "bulleted_list"
  | "numbered_list"
  | "todo"
  | "toggle"
  | "quote"
  | "callout"
  | "divider"
  | "code";

export interface Block {
  id: string;
  type: BlockType;
  text: string;
  /** Case à cocher (todo). */
  checked?: boolean;
  /** Contenu replié d'une bascule (toggle). */
  body?: string;
  /** Emoji d'un encadré (callout). */
  icon?: string;
}

export type CoverKey = "sunset" | "ocean" | "forest" | "dusk" | "sand" | "slate";

export interface PageSummary {
  id: string;
  title: string;
  icon: string | null;
  parentId: string | null;
  position: number;
  updatedAt: string;
  /** Date de mise à la corbeille ; null si la page est active. */
  trashedAt: string | null;
}

export interface Page extends PageSummary {
  cover: CoverKey | null;
  blocks: Block[];
  createdAt: string;
}
