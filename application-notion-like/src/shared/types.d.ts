export type Role = "editor" | "reader";

export interface User {
  id: string;
  name: string;
  role: Role;
}

export type BlockType = "heading" | "paragraph" | "bullet";

export interface Block {
  id: string;
  type: BlockType;
  text: string;
}

export interface Comment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export type ThreadStatus = "open" | "resolved";

export interface Thread {
  id: string;
  pageId: string;
  /** Passage commenté ; null quand le commentaire porte sur toute la page. */
  blockId: string | null;
  /** Extrait du passage au moment du commentaire, conservé si le bloc est supprimé. */
  quote: string | null;
  status: ThreadStatus;
  resolvedBy: string | null;
  resolvedAt: string | null;
  /** Premier élément = commentaire d'origine, les suivants = réponses. */
  comments: Comment[];
}

export interface Page {
  id: string;
  title: string;
  blocks: Block[];
  threads: Thread[];
  createdAt: string;
  updatedAt: string;
}

export interface PageSummary {
  id: string;
  title: string;
  updatedAt: string;
  openThreads: number;
}

export interface Database {
  pages: Page[];
}
