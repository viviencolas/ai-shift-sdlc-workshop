import type { Block } from "../shared/types.js";

export interface Template {
  name: string;
  icon: string;
  description: string;
  blocks: Omit<Block, "id">[];
}

/** Modèles proposés dans la barre latérale : chaque utilisation crée une page indépendante. */
export const TEMPLATES: readonly Template[] = [
  {
    name: "Notes de réunion",
    icon: "📝",
    description: "Ordre du jour, notes et actions à suivre.",
    blocks: [
      { type: "callout", text: "Date, participants et objectif de la réunion.", icon: "📌" },
      { type: "heading_2", text: "Ordre du jour" },
      { type: "numbered_list", text: "" },
      { type: "heading_2", text: "Notes" },
      { type: "bulleted_list", text: "" },
      { type: "heading_2", text: "Actions" },
      { type: "todo", text: "", checked: false },
    ],
  },
  {
    name: "Liste de tâches",
    icon: "✅",
    description: "Tâches à faire, en cours et terminées.",
    blocks: [
      { type: "heading_2", text: "À faire" },
      { type: "todo", text: "Première tâche", checked: false },
      { type: "todo", text: "Deuxième tâche", checked: false },
      { type: "heading_2", text: "Terminé" },
      { type: "todo", text: "Tâche terminée", checked: true },
    ],
  },
  {
    name: "Document de projet",
    icon: "📐",
    description: "Contexte, objectifs, périmètre et questions ouvertes.",
    blocks: [
      { type: "heading_1", text: "Contexte" },
      { type: "paragraph", text: "" },
      { type: "heading_1", text: "Objectifs" },
      { type: "bulleted_list", text: "" },
      { type: "heading_1", text: "Périmètre" },
      { type: "toggle", text: "Hors périmètre", body: "" },
      { type: "divider", text: "" },
      { type: "quote", text: "Questions ouvertes" },
    ],
  },
  {
    name: "Journal",
    icon: "📔",
    description: "Une entrée par jour, avec ce qui a été appris.",
    blocks: [
      { type: "heading_2", text: "Aujourd'hui" },
      { type: "paragraph", text: "" },
      { type: "heading_2", text: "Ce que j'ai appris" },
      { type: "bulleted_list", text: "" },
    ],
  },
];
