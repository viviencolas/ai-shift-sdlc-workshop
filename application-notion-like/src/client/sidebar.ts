import type { PageSummary } from "../shared/types.js";
import { el, iconButton, svgIcon } from "./dom.js";

export interface SidebarActions {
  currentId(): string | null;
  open(id: string): void;
  createPage(parentId: string | null): void;
  trashPage(id: string): void;
  openSearch(): void;
  openTemplates(): void;
  openTrash(): void;
}

const EXPANDED_KEY = "notion-like:expanded";

/** Pages dépliées dans l'arborescence : simple préférence d'affichage gardée dans le navigateur. */
const expanded = new Set<string>(JSON.parse(localStorage.getItem(EXPANDED_KEY) ?? "[]") as string[]);
const saveExpanded = (): void => localStorage.setItem(EXPANDED_KEY, JSON.stringify([...expanded]));

export function expandPage(id: string): void {
  expanded.add(id);
  saveExpanded();
}

export function pageLabel(page: Pick<PageSummary, "title">): string {
  return page.title.trim() || "Sans titre";
}

export function pageIcon(page: Pick<PageSummary, "icon">, size = 18): HTMLElement {
  const span = el("span", { class: "page-icon", "aria-hidden": "true" });
  if (page.icon) span.textContent = page.icon;
  else span.append(svgIcon("file", size - 2));
  return span;
}

export function ancestors(pages: readonly PageSummary[], id: string | null): PageSummary[] {
  const byId = new Map(pages.map((p) => [p.id, p]));
  const chain: PageSummary[] = [];
  let current = id ? byId.get(id) : undefined;
  while (current && chain.length < 50) {
    chain.unshift(current);
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  return chain;
}

function navItem(icon: Parameters<typeof svgIcon>[0], label: string, run: () => void, hint?: string): HTMLButtonElement {
  const button = el("button", { type: "button", class: "nav-item" }, svgIcon(icon, 18), el("span", { class: "nav-label" }, label));
  if (hint) button.append(el("span", { class: "nav-hint" }, hint));
  button.addEventListener("click", run);
  return button;
}

export function renderSidebar(root: HTMLElement, pages: readonly PageSummary[], actions: SidebarActions): void {
  const current = actions.currentId();
  for (const page of ancestors(pages, current).slice(0, -1)) expanded.add(page.id);
  const children = new Map<string | null, PageSummary[]>();
  for (const page of pages) {
    const key = page.parentId && pages.some((p) => p.id === page.parentId) ? page.parentId : null;
    children.set(key, [...(children.get(key) ?? []), page]);
  }

  const renderTree = (parentId: string | null, depth: number): HTMLElement[] =>
    (children.get(parentId) ?? []).flatMap((page) => {
      const isOpen = expanded.has(page.id);
      const row = el("div", {
        class: `tree-row${page.id === current ? " active" : ""}`,
        role: "treeitem",
        "aria-expanded": String(isOpen),
        "data-page": page.id,
      });
      row.style.paddingLeft = `${8 + depth * 14}px`;
      const toggle = iconButton("chevronRight", isOpen ? "Replier" : "Déplier", `tree-toggle${isOpen ? " open" : ""}`);
      toggle.addEventListener("click", (event) => {
        event.stopPropagation();
        if (isOpen) expanded.delete(page.id);
        else expanded.add(page.id);
        saveExpanded();
        renderSidebar(root, pages, actions);
      });
      const title = el("a", { class: "tree-title", href: `#/pages/${page.id}` }, pageLabel(page));
      const trash = iconButton("trash", "Placer dans la corbeille", "tree-action");
      trash.addEventListener("click", (event) => {
        event.stopPropagation();
        actions.trashPage(page.id);
      });
      const add = iconButton("plus", "Ajouter une sous-page", "tree-action");
      add.addEventListener("click", (event) => {
        event.stopPropagation();
        expandPage(page.id);
        actions.createPage(page.id);
      });
      row.append(toggle, pageIcon(page), title, el("span", { class: "tree-actions" }, trash, add));
      row.addEventListener("click", (event) => {
        if ((event.target as HTMLElement).closest("button, a")) return;
        actions.open(page.id);
      });
      const nodes: HTMLElement[] = [row];
      if (isOpen) {
        const sub = renderTree(page.id, depth + 1);
        if (sub.length === 0) {
          const empty = el("div", { class: "tree-empty" }, "Aucune page à l'intérieur");
          empty.style.paddingLeft = `${8 + (depth + 1) * 14 + 22}px`;
          nodes.push(empty);
        } else nodes.push(...sub);
      }
      return nodes;
    });

  const addRoot = iconButton("plus", "Ajouter une page", "section-action");
  addRoot.addEventListener("click", () => actions.createPage(null));
  const tree = el("div", { class: "tree", role: "tree", "aria-label": "Pages de l'espace de travail" }, ...renderTree(null, 0));
  if (pages.length === 0) tree.append(el("div", { class: "tree-empty" }, "Aucune page"));

  root.replaceChildren(
    el(
      "div",
      { class: "workspace" },
      el("span", { class: "workspace-avatar", "aria-hidden": "true" }, "A"),
      el("span", { class: "workspace-name" }, "Atelier AI SDLC"),
    ),
    el(
      "nav",
      { class: "nav-group", "aria-label": "Actions" },
      navItem("search", "Recherche", actions.openSearch, "Ctrl K"),
      navItem("plus", "Nouvelle page", () => actions.createPage(null)),
    ),
    el("div", { class: "section-title" }, el("span", {}, "Espace de travail"), addRoot),
    tree,
    el(
      "nav",
      { class: "nav-group nav-bottom", "aria-label": "Outils" },
      navItem("template", "Modèles", actions.openTemplates),
      navItem("trash", "Corbeille", actions.openTrash),
    ),
  );
}
