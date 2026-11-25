export type BlockType = "heading" | "paragraph" | "bullet";

export interface Block {
  id: string;
  type: BlockType;
  text: string;
}

export interface Page {
  id: string;
  title: string;
  blocks: Block[];
  createdAt: string;
  updatedAt: string;
}

export interface PageSummary {
  id: string;
  title: string;
  updatedAt: string;
}

/** Contenu complet du fichier JSON de stockage. */
export interface Database {
  pages: Page[];
}
