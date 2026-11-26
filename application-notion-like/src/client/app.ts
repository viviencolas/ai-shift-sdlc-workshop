import type { Block, Page, PageSummary } from "../shared/types.js";
import { api, type PagePatch } from "./api.js";
import { $, el, iconButton, svgIcon, toast, uid } from "./dom.js";
import { BlockEditor } from "./editor.js";
import { openCoverPicker, openEmojiPicker, openSearch, openTemplates, openTrash } from "./modals.js";
import { ancestors, expandPage, pageIcon, pageLabel, renderSidebar } from "./sidebar.js";
import type { Template } from "./templates.js";

const sidebar = $("sidebar");
const main = $("main");

let pages: PageSummary[] = [];
let current: Page | null = null;
let pending: PagePatch = {};
let saveTimer: number | undefined;
let saving: Promise<void> = Promise.resolve();
let status: HTMLElement | null = null;

const currentId = (): string | null => /^#\/pages\/(.+)$/.exec(location.hash)?.[1] ?? null;
const go = (id: string): void => {
  location.hash = `#/pages/${id}`;
};

function setStatus(text: string): void {
  if (status) status.textContent = text;
}

async function flush(): Promise<void> {
  window.clearTimeout(saveTimer);
  saveTimer = undefined;
  const page = current;
  const patch = pending;
  pending = {};
  if (!page || Object.keys(patch).length === 0) return saving;
  saving = saving.then(async () => {
    setStatus("Enregistrement…");
    try {
      const saved = await api.updatePage(page.id, patch);
      pages = pages.map((p) => (p.id === saved.id ? { ...p, title: saved.title, icon: saved.icon, updatedAt: saved.updatedAt } : p));
      if (current?.id === saved.id) setStatus("Enregistré");
    } catch (error) {
      setStatus("Non enregistré");
      toast((error as Error).message);
    }
  });
  return saving;
}

function schedule(patch: PagePatch): void {
  if (!current) return;
  Object.assign(current, patch);
  pending = { ...pending, ...patch };
  setStatus("Modifications…");
  window.clearTimeout(saveTimer);
  saveTimer = window.setTimeout(() => void flush(), 500);
}

/** Changement visible dans la barre latérale (titre, icône) : on la met à jour tout de suite. */
function touchSummary(patch: Partial<PageSummary>): void {
  if (!current) return;
  pages = pages.map((p) => (p.id === current?.id ? { ...p, ...patch } : p));
  drawSidebar();
  drawBreadcrumb();
}

function drawSidebar(): void {
  renderSidebar(sidebar, pages, {
    currentId,
    open: go,
    createPage: (parentId) => void createPage({ parentId }),
    trashPage: (id) => void trashPage(id),
    openSearch: () => openSearch(pages, go),
    openTemplates: () => openTemplates((template) => void useTemplate(template)),
    openTrash: () =>
      openTrash({
        load: api.listTrash,
        open: go,
        restore: async (id) => {
          await api.updatePage(id, { trashed: false });
          await refreshPages();
          if (current?.id === id) await showPage(id);
          toast("Page restaurée.");
        },
        destroy: async (id) => {
          await api.deletePage(id);
          if (current?.id === id || (current && ancestors(pages, current.id).some((p) => p.id === id))) location.hash = "";
          toast("Page supprimée définitivement.");
        },
      }),
  });
}

async function refreshPages(): Promise<void> {
  pages = await api.listPages();
  drawSidebar();
}

async function createPage(input: PagePatch & { parentId?: string | null }): Promise<void> {
  await flush();
  try {
    const page = await api.createPage({ title: "", blocks: [], ...input });
    if (input.parentId) expandPage(input.parentId);
    await refreshPages();
    go(page.id);
  } catch (error) {
    toast((error as Error).message);
  }
}

function useTemplate(template: Template): Promise<void> {
  const blocks: Block[] = template.blocks.map((block) => ({ ...block, id: uid() }));
  return createPage({ title: template.name, icon: template.icon, blocks });
}

async function trashPage(id: string): Promise<void> {
  await flush();
  try {
    await api.updatePage(id, { trashed: true });
    await refreshPages();
    if (current && !pages.some((p) => p.id === current?.id)) await showPage(current.id);
    toast("Page placée dans la corbeille.");
  } catch (error) {
    toast((error as Error).message);
  }
}

function crumbChain(): PageSummary[] {
  if (!current) return [];
  const chain = ancestors(pages, current.id);
  return chain.length ? chain : [current];
}

function drawBreadcrumb(): void {
  const nav = main.querySelector<HTMLElement>(".breadcrumb");
  if (!nav) return;
  const items = crumbChain().flatMap((page, i) => {
    const link = el("a", { class: "crumb", href: `#/pages/${page.id}` }, pageIcon(page, 16), el("span", {}, pageLabel(page)));
    return i === 0 ? [link] : [el("span", { class: "crumb-sep", "aria-hidden": "true" }, "/"), link];
  });
  nav.replaceChildren(...items);
}

function emptyState(): void {
  current = null;
  status = null;
  const create = el("button", { type: "button", class: "text-btn primary" }, svgIcon("plus"), "Nouvelle page");
  create.addEventListener("click", () => void createPage({}));
  main.replaceChildren(
    el("div", { class: "topbar" }, mobileToggle()),
    el("div", { class: "empty" }, el("p", {}, pages.length ? "Choisissez une page dans la barre latérale." : "Aucune page pour l'instant."), create),
  );
}

function mobileToggle(): HTMLButtonElement {
  const button = iconButton("menu", "Afficher les pages", "icon-btn mobile-only");
  button.addEventListener("click", () => document.body.classList.toggle("sidebar-open"));
  return button;
}

function renderPage(page: Page): void {
  const readOnly = page.trashedAt !== null;
  status = el("span", { class: "save-status", role: "status" }, readOnly ? "" : "Enregistré");
  const topbar = el("div", { class: "topbar" }, mobileToggle(), el("nav", { class: "breadcrumb", "aria-label": "Fil d'Ariane" }), status);

  const banner = readOnly
    ? (() => {
        const restore = el("button", { type: "button", class: "banner-btn" }, "Restaurer la page");
        restore.addEventListener("click", async () => {
          await api.updatePage(page.id, { trashed: false });
          await refreshPages();
          await showPage(page.id);
          toast("Page restaurée.");
        });
        const destroy = el("button", { type: "button", class: "banner-btn danger" }, "Supprimer définitivement");
        destroy.addEventListener("click", async () => {
          if (!window.confirm(`Supprimer définitivement « ${pageLabel(page)} » et ses sous-pages ?`)) return;
          await api.deletePage(page.id);
          location.hash = "";
          toast("Page supprimée définitivement.");
        });
        return el("div", { class: "trash-banner", role: "alert" }, el("span", {}, "Cette page est dans la corbeille."), restore, destroy);
      })()
    : null;

  const cover = page.cover ? el("div", { class: `cover cover-${page.cover}` }) : null;
  if (cover && !readOnly) {
    const change = el("button", { type: "button", class: "cover-btn" }, "Changer la couverture");
    change.addEventListener("click", () => openCoverPicker(change, (key) => update({ cover: key })));
    const remove = el("button", { type: "button", class: "cover-btn" }, "Retirer");
    remove.addEventListener("click", () => update({ cover: null }));
    cover.append(el("div", { class: "cover-actions" }, change, remove));
  }

  const header = el("div", { class: `page-header${page.cover ? " has-cover" : ""}${page.icon ? " has-icon" : ""}` });
  if (page.icon) {
    const icon = el("button", { type: "button", class: "page-emoji", "aria-label": "Changer l'icône" }, page.icon);
    icon.disabled = readOnly;
    icon.addEventListener("click", () => openEmojiPicker(icon, (emoji) => update({ icon: emoji })));
    header.append(icon);
  }
  if (!readOnly) {
    const controls = el("div", { class: "page-controls" });
    if (!page.icon) {
      const addIcon = el("button", { type: "button", class: "ghost-btn" }, svgIcon("smile"), "Ajouter une icône");
      addIcon.addEventListener("click", () => openEmojiPicker(addIcon, (emoji) => update({ icon: emoji })));
      controls.append(addIcon);
    }
    if (!page.cover) {
      const addCover = el("button", { type: "button", class: "ghost-btn" }, svgIcon("image"), "Ajouter une couverture");
      addCover.addEventListener("click", () => update({ cover: "sunset" }));
      controls.append(addCover);
    }
    header.append(controls);
  }

  const title = el("h1", { class: "page-title", "data-placeholder": "Sans titre" });
  title.textContent = page.title;
  let editor: BlockEditor;
  if (!readOnly) {
    try {
      title.contentEditable = "plaintext-only";
    } catch {
      title.contentEditable = "true";
    }
    if (title.contentEditable !== "plaintext-only") title.contentEditable = "true";
    title.setAttribute("aria-label", "Titre de la page");
    title.addEventListener("input", () => {
      const raw = title.innerText.replace(/\n/g, " ");
      const text = raw.trim() === "" ? "" : raw.slice(0, 200);
      if (text === "" && title.childNodes.length > 0) title.replaceChildren();
      schedule({ title: text });
      touchSummary({ title: text });
    });
    title.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        editor.focusFirst();
      }
    });
    title.addEventListener("paste", (event) => {
      event.preventDefault();
      document.execCommand("insertText", false, (event.clipboardData?.getData("text/plain") ?? "").replace(/\s+/g, " "));
    });
  }
  header.append(title);

  editor = new BlockEditor(page.blocks, (blocks) => schedule({ blocks }), readOnly);
  const tail = el("div", { class: "editor-tail", "aria-hidden": "true" });
  tail.addEventListener("click", () => editor.focusEnd());

  main.replaceChildren(topbar, el("div", { class: "scroller" }, banner, cover, el("article", { class: "page" }, header, editor.root, readOnly ? null : tail)));
  drawBreadcrumb();
  document.title = `${page.icon ? `${page.icon} ` : ""}${pageLabel(page)}`;
  if (!readOnly && page.title === "" && page.blocks.length === 0) title.focus();

  function update(patch: PagePatch): void {
    if (!current) return;
    schedule(patch);
    if ("icon" in patch) touchSummary({ icon: patch.icon ?? null });
    renderPage(current);
    void flush();
  }
}

async function showPage(id: string): Promise<void> {
  try {
    const page = await api.getPage(id);
    if (currentId() !== id) return;
    current = page;
    renderPage(page);
    drawSidebar();
  } catch (error) {
    toast((error as Error).message);
    location.hash = "";
  }
}

async function route(): Promise<void> {
  await flush();
  document.body.classList.remove("sidebar-open");
  const id = currentId();
  if (!id) {
    const first = pages[0];
    if (first) go(first.id);
    else emptyState();
    drawSidebar();
    return;
  }
  await showPage(id);
}

document.addEventListener("keydown", (event) => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
    event.preventDefault();
    openSearch(pages, go);
  }
});
window.addEventListener("hashchange", () => void route());
window.addEventListener("beforeunload", (event) => {
  if (saveTimer !== undefined) {
    void flush();
    event.preventDefault();
  }
});
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "hidden") void flush();
});

refreshPages()
  .then(route)
  .catch((error: Error) => {
    main.replaceChildren(el("div", { class: "empty" }, el("p", {}, `Impossible de charger les pages : ${error.message}`)));
  });

document.querySelector(".sidebar-scrim")?.addEventListener("click", () => document.body.classList.remove("sidebar-open"));
