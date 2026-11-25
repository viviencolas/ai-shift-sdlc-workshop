import type { Block, BlockType, Page, PageSummary, Thread, User } from "../shared/types.js";

type Filter = "open" | "all";

const state = {
  users: [] as User[],
  user: null as User | null,
  pages: [] as PageSummary[],
  page: null as Page | null,
  editing: false,
  editNext: false,
  filter: "open" as Filter,
  draftBlockId: null as string | null,
  highlight: null as string | null,
};

const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<Record<string, string>> = {},
  ...children: (Node | string)[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) node.setAttribute(key, value);
  }
  node.append(...children);
  return node;
}

function toast(message: string): void {
  const node = $("toast");
  node.textContent = message;
  node.classList.add("show");
  window.setTimeout(() => node.classList.remove("show"), 4000);
}

async function api<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const response = await fetch(`/api${path}`, {
    method: init.method ?? "GET",
    headers: { "content-type": "application/json", "x-user": state.user?.id ?? "" },
    body: init.body === undefined ? undefined : JSON.stringify(init.body),
  });
  const data = (await response.json()) as T & { error?: string };
  if (!response.ok) throw new Error(data.error ?? "Erreur inattendue.");
  return data;
}

async function guarded(action: () => Promise<void>): Promise<void> {
  try {
    await action();
  } catch (err) {
    toast(err instanceof Error ? err.message : "Erreur inattendue.");
  }
}

const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });

const isEditor = (): boolean => state.user?.role === "editor";
const currentId = (): string | null => /^#\/pages\/(.+)$/.exec(location.hash)?.[1] ?? null;

async function refreshList(): Promise<void> {
  state.pages = await api<PageSummary[]>("/pages");
  const nav = $("page-list");
  nav.replaceChildren(
    ...state.pages.map((p) => {
      const link = el("a", { href: `#/pages/${p.id}`, class: p.id === currentId() ? "active" : "" }, el("span", {}, p.title));
      if (p.openThreads > 0) {
        link.append(el("span", { class: "badge", title: "Fils ouverts" }, String(p.openThreads)));
      }
      return link;
    }),
  );
}

async function loadPage(): Promise<void> {
  const id = currentId();
  state.page = id ? await api<Page>(`/pages/${id}`).catch(() => null) : null;
  await refreshList();
  render();
}

function renderBlocks(page: Page): HTMLElement {
  const wrapper = el("div", { class: "blocks" });
  let list: HTMLUListElement | null = null;
  for (const block of page.blocks) {
    const hasThread = page.threads.some((t) => t.blockId === block.id && t.status === "open");
    const row = el("div", { class: `block${hasThread ? " has-thread" : ""}`, "data-block": block.id });
    if (block.type === "bullet") {
      if (!list) {
        list = el("ul");
        wrapper.append(el("div", { class: "block-list" }, list));
      }
      list.append(el("li", {}, block.text));
      continue;
    }
    list = null;
    row.append(block.type === "heading" ? el("h3", {}, block.text) : el("p", {}, block.text));
    row.append(
      el("button", { type: "button", class: "link comment-btn", "data-comment-block": block.id }, "Commenter ce passage"),
    );
    wrapper.append(row);
  }
  wrapper.addEventListener("click", (event) => {
    const target = (event.target as HTMLElement).closest<HTMLElement>("[data-comment-block]");
    if (!target) return;
    state.draftBlockId = target.dataset.commentBlock ?? null;
    render();
    document.querySelector<HTMLTextAreaElement>("#new-comment-text")?.focus();
  });
  return wrapper;
}

function renderEditor(page: Page): HTMLElement {
  const form = el("form", { class: "editor" });
  const title = el("input", { id: "edit-title", value: page.title, "aria-label": "Titre", maxlength: "200" });
  title.style.cssText = "font-size:28px;width:100%;margin-bottom:12px";
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
      await api<Page>(`/pages/${page.id}`, { method: "PUT", body: { title: title.value, blocks } });
      state.editing = false;
      await loadPage();
    });
  });
  return form;
}

function renderThread(page: Page, thread: Thread): HTMLElement {
  const classes = ["thread", thread.status, state.highlight === thread.id ? "highlight" : ""].join(" ");
  const box = el("section", { class: classes, "data-thread": thread.id, "aria-label": "Fil de commentaires" });
  const status = el("span", { class: `status ${thread.status}` }, thread.status === "open" ? "Ouvert" : "Résolu");
  const head = el("div", { class: "thread-head" }, status);
  if (isEditor()) {
    const toggle = el(
      "button",
      { type: "button", class: "link", "data-action": thread.status === "open" ? "resolve" : "reopen" },
      thread.status === "open" ? "Résoudre" : "Rouvrir",
    );
    toggle.addEventListener("click", () =>
      guarded(async () => {
        await api(`/pages/${page.id}/threads/${thread.id}/${toggle.dataset.action}`, { method: "POST" });
        await loadPage();
      }),
    );
    head.append(toggle);
  }
  box.append(head);
  if (thread.quote !== null) {
    const stillThere = page.blocks.some((b) => b.id === thread.blockId);
    box.append(el("blockquote", { class: "quote" }, `« ${thread.quote} »${stillThere ? "" : " (passage supprimé)"}`));
  }
  thread.comments.forEach((c, index) => {
    box.append(
      el(
        "article",
        { class: `comment${index > 0 ? " reply" : ""}` },
        el("div", { class: "comment-meta" }, el("strong", {}, c.authorName), ` · ${formatDate(c.createdAt)}`),
        el("div", { class: "comment-text" }, c.text),
      ),
    );
  });
  if (thread.status === "resolved" && thread.resolvedBy && thread.resolvedAt) {
    box.append(el("p", { class: "notice" }, `Résolu par ${thread.resolvedBy} · ${formatDate(thread.resolvedAt)}`));
  }
  const reply = el("textarea", { rows: "2", "aria-label": "Votre réponse", placeholder: "Répondre…", maxlength: "2000" });
  const send = el("button", { type: "submit" }, "Répondre");
  const form = el("form", { class: "reply-form" }, reply, el("div", { class: "row" }, send));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void guarded(async () => {
      state.highlight = thread.id;
      await api(`/pages/${page.id}/threads/${thread.id}/replies`, { method: "POST", body: { text: reply.value } });
      await loadPage();
    });
  });
  box.append(form);
  return box;
}

function renderComments(page: Page): HTMLElement {
  const section = el("aside", { class: "comments", "aria-label": "Commentaires" });
  section.append(el("h3", {}, "Commentaires"));
  const filter = el("div", { class: "filter" });
  for (const [value, label] of [["open", "Fils ouverts"], ["all", "Tous"]] as const) {
    const button = el("button", { type: "button", "aria-pressed": String(state.filter === value) }, label);
    button.addEventListener("click", () => {
      state.filter = value;
      render();
    });
    filter.append(button);
  }
  section.append(filter);
  const threads = page.threads.filter((t) => state.filter === "all" || t.status === "open");
  if (page.threads.length === 0) section.append(el("p", { class: "empty" }, "Aucun commentaire sur cette page."));
  else if (threads.length === 0) section.append(el("p", { class: "empty" }, "Aucun fil ouvert."));
  threads.forEach((t) => section.append(renderThread(page, t)));

  const block = page.blocks.find((b) => b.id === state.draftBlockId);
  const text = el("textarea", { id: "new-comment-text", rows: "3", "aria-label": "Nouveau commentaire", maxlength: "2000" });
  const form = el("form", { class: "new-comment" });
  form.append(
    el("strong", {}, block ? "Commenter ce passage" : "Commenter la page"),
    ...(block ? [el("p", { class: "quote" }, `« ${block.text.slice(0, 120)} »`)] : []),
    text,
  );
  const send = el("button", { type: "submit", class: "primary" }, "Commenter");
  form.append(send);
  if (block) {
    const whole = el("button", { type: "button", class: "link" }, "Commenter la page entière");
    whole.addEventListener("click", () => {
      state.draftBlockId = null;
      render();
    });
    form.append(whole);
  }
  if (!isEditor()) form.append(el("p", { class: "notice" }, "Lecture seule : vous pouvez commenter et répondre, mais pas résoudre un fil."));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    void guarded(async () => {
      const created = await api<Thread>(`/pages/${page.id}/threads`, {
        method: "POST",
        body: { text: text.value, blockId: state.draftBlockId },
      });
      state.draftBlockId = null;
      state.highlight = created.id;
      await loadPage();
    });
  });
  section.append(form);
  return section;
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
  const content = el("div", { class: "page" });
  content.append(el("h2", {}, page.title), el("div", { class: "meta" }, `Modifiée le ${formatDate(page.updatedAt)}`));
  if (state.editing && isEditor()) {
    content.append(renderEditor(page));
  } else {
    if (isEditor()) {
      const edit = el("button", { type: "button", id: "edit-page" }, "Modifier");
      edit.addEventListener("click", () => {
        state.editing = true;
        render();
      });
      content.append(el("div", { class: "toolbar" }, edit));
    }
    content.append(page.blocks.length ? renderBlocks(page) : el("p", { class: "empty" }, "Page vide."));
  }
  main.replaceChildren(content, renderComments(page));
}

async function init(): Promise<void> {
  state.users = await api<User[]>("/users");
  const stored = localStorage.getItem("user");
  state.user = state.users.find((u) => u.id === stored) ?? state.users[0] ?? null;
  const select = $<HTMLSelectElement>("user-select");
  for (const u of state.users) {
    const option = el("option", { value: u.id }, `${u.name} (${u.role === "editor" ? "éditeur" : "lecteur seul"})`);
    if (u.id === state.user?.id) option.selected = true;
    select.append(option);
  }
  select.addEventListener("change", () => {
    state.user = state.users.find((u) => u.id === select.value) ?? state.user;
    localStorage.setItem("user", select.value);
    state.editing = false;
    render();
  });
  $("new-page").addEventListener("click", () =>
    guarded(async () => {
      const page = await api<Page>("/pages", { method: "POST", body: { title: "Sans titre", blocks: [] } });
      state.editNext = true;
      location.hash = `#/pages/${page.id}`;
    }),
  );
  window.addEventListener("hashchange", () => {
    state.editing = state.editNext;
    state.editNext = false;
    state.draftBlockId = null;
    void loadPage();
  });
  if (!currentId()) {
    const pages = await api<PageSummary[]>("/pages");
    if (pages[0]) location.hash = `#/pages/${pages[0].id}`;
  }
  await loadPage();
}

void guarded(init);
