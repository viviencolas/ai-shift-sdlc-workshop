import type { Block, BlockType, Page, PageSummary } from "../shared/types.js";
import { api } from "./api.js";
import { $, el, formatDate, toast } from "./dom.js";

const state = {
  pages: [] as PageSummary[],
  page: null as Page | null,
  editing: false,
  editNext: false,
};

const currentId = (): string | null => /^#\/pages\/(.+)$/.exec(location.hash)?.[1] ?? null;

async function guarded(action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch (err) {
    toast(err instanceof Error ? err.message : "Erreur inattendue.");
  }
}

async function refreshList(): Promise<void> {
  state.pages = await api.listPages();
  $("page-list").replaceChildren(
    ...state.pages.map((p) =>
      el("a", { href: `#/pages/${p.id}`, class: p.id === currentId() ? "active" : "" }, p.title),
    ),
  );
}

async function loadPage(): Promise<void> {
  const id = currentId();
  state.page = id ? await api.getPage(id).catch(() => null) : null;
  await refreshList();
  render();
}

function renderBlocks(page: Page): HTMLElement {
  const wrapper = el("div", { class: "blocks" });
  let list: HTMLUListElement | null = null;
  for (const block of page.blocks) {
    if (block.type === "bullet") {
      if (!list) {
        list = el("ul");
        wrapper.append(el("div", { class: "block" }, list));
      }
      list.append(el("li", {}, block.text));
      continue;
    }
    list = null;
    wrapper.append(
      el("div", { class: "block", "data-block": block.id }, block.type === "heading" ? el("h3", {}, block.text) : el("p", {}, block.text)),
    );
  }
  return wrapper;
}

function renderEditor(page: Page): HTMLElement {
  const form = el("form", { class: "editor" });
  const title = el("input", { id: "edit-title", value: page.title, "aria-label": "Titre", maxlength: "200" });
  const rows = el("div", { id: "edit-rows" });
  const addRow = (block: Block): void => {
    const select = el("select", { "aria-label": "Type de bloc" });
    for (const [value, label] of [["paragraph", "Texte"], ["heading", "Titre"], ["bullet", "Liste à puces"]] as const) {
      const option = el("option", { value }, label);
      if (value === block.type) option.selected = true;
      select.append(option);
    }
    const input = el("input", { "aria-label": "Contenu du bloc", value: block.text });
    const remove = el("button", { type: "button" }, "Supprimer");
    const row = el("div", { class: "edit-row", "data-id": block.id }, select, input, remove);
    remove.addEventListener("click", () => row.remove());
    rows.append(row);
  };
  page.blocks.forEach(addRow);
  const add = el("button", { type: "button" }, "Ajouter un bloc");
  add.addEventListener("click", () => addRow({ id: crypto.randomUUID(), type: "paragraph", text: "" }));
  const save = el("button", { type: "submit", class: "primary" }, "Enregistrer");
  const cancel = el("button", { type: "button" }, "Annuler");
  cancel.addEventListener("click", () => {
    state.editing = false;
    render();
  });
  form.append(title, rows, el("div", { class: "toolbar" }, add, save, cancel));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const blocks: Block[] = [...rows.querySelectorAll<HTMLElement>(".edit-row")].map((row) => ({
      id: row.dataset.id ?? crypto.randomUUID(),
      type: row.querySelector("select")?.value as BlockType,
      text: row.querySelector("input")?.value ?? "",
    }));
    void guarded(async () => {
      await api.updatePage(page.id, title.value, blocks);
      state.editing = false;
      await loadPage();
    });
  });
  return form;
}

function renderToolbar(page: Page): HTMLElement {
  const edit = el("button", { type: "button", id: "edit-page" }, "Modifier");
  edit.addEventListener("click", () => {
    state.editing = true;
    render();
  });
  const remove = el("button", { type: "button", id: "delete-page" }, "Supprimer la page");
  remove.addEventListener("click", () => {
    if (!window.confirm(`Supprimer la page « ${page.title} » ?`)) return;
    void guarded(async () => {
      await api.deletePage(page.id);
      state.page = null;
      state.editing = false;
      const [next] = (await api.listPages()).filter((p) => p.id !== page.id);
      location.hash = next ? `#/pages/${next.id}` : "";
      await loadPage();
    });
  });
  return el("div", { class: "toolbar" }, edit, remove);
}

function render(): void {
  const main = $("main");
  const page = state.page;
  if (!page) {
    main.replaceChildren(
      el("p", { class: "empty" }, state.pages.length ? "Choisissez une page dans la liste." : "Aucune page. Créez la première."),
    );
    return;
  }
  const content = el("div", { class: "page" }, el("h2", {}, page.title), el("div", { class: "meta" }, `Modifiée le ${formatDate(page.updatedAt)}`));
  if (state.editing) {
    content.append(renderEditor(page));
  } else {
    content.append(renderToolbar(page), page.blocks.length ? renderBlocks(page) : el("p", { class: "empty" }, "Page vide."));
  }
  main.replaceChildren(content);
}

async function init(): Promise<void> {
  $("new-page").addEventListener("click", () =>
    guarded(async () => {
      const page = await api.createPage("Sans titre");
      state.editNext = true;
      location.hash = `#/pages/${page.id}`;
    }),
  );
  window.addEventListener("hashchange", () => {
    state.editing = state.editNext;
    state.editNext = false;
    void loadPage();
  });
  if (!currentId()) {
    const [first] = await api.listPages();
    if (first) location.hash = `#/pages/${first.id}`;
  }
  await loadPage();
}

void guarded(init);
