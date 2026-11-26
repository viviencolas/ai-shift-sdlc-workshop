import type { CoverKey, PageSummary } from "../shared/types.js";
import { el, formatDate, iconButton, openPopover, svgIcon } from "./dom.js";
import { ancestors, pageIcon, pageLabel } from "./sidebar.js";
import { TEMPLATES, type Template } from "./templates.js";

const normalize = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/** Fenêtre modale centrée ; Échap ou clic sur le fond la ferment. */
function openModal(label: string, body: HTMLElement, className = ""): () => void {
  document.querySelector(".modal-backdrop")?.remove();
  const modal = el("div", { class: `modal ${className}`.trim(), role: "dialog", "aria-modal": "true", "aria-label": label }, body);
  const backdrop = el("div", { class: "modal-backdrop" }, modal);
  const previous = document.activeElement as HTMLElement | null;
  const close = (): void => {
    backdrop.remove();
    document.removeEventListener("keydown", onKey, true);
    previous?.focus?.();
  };
  const onKey = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      event.preventDefault();
      close();
    }
  };
  backdrop.addEventListener("mousedown", (event) => {
    if (event.target === backdrop) close();
  });
  document.addEventListener("keydown", onKey, true);
  document.body.append(backdrop);
  return close;
}

export function openSearch(pages: readonly PageSummary[], open: (id: string) => void): void {
  const input = el("input", { class: "search-input", type: "search", placeholder: "Rechercher une page…", "aria-label": "Rechercher une page" });
  const results = el("div", { class: "search-results", role: "listbox" });
  const body = el("div", { class: "search" }, el("div", { class: "search-bar" }, svgIcon("search", 18), input), results);
  const close = openModal("Recherche", body, "modal-search");
  let index = 0;
  let matches: PageSummary[] = [];

  const render = (): void => {
    const q = normalize(input.value.trim());
    matches = q
      ? pages
          .filter((p) => normalize(pageLabel(p)).includes(q))
          .sort((a, b) => Number(!normalize(pageLabel(a)).startsWith(q)) - Number(!normalize(pageLabel(b)).startsWith(q)))
      : [...pages].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8);
    index = Math.min(index, Math.max(0, matches.length - 1));
    results.replaceChildren(el("div", { class: "search-label" }, q ? "Pages" : "Modifiées récemment"));
    if (matches.length === 0) results.append(el("div", { class: "search-empty" }, "Aucun résultat"));
    matches.forEach((page, i) => {
      const path = ancestors(pages, page.parentId).map(pageLabel).join(" / ");
      const item = el(
        "div",
        { class: `search-item${i === index ? " active" : ""}`, role: "option", "aria-selected": String(i === index) },
        pageIcon(page),
        el("span", { class: "search-title" }, pageLabel(page)),
        path ? el("span", { class: "search-path" }, path) : null,
      );
      item.addEventListener("click", () => {
        close();
        open(page.id);
      });
      results.append(item);
    });
  };
  input.addEventListener("input", () => {
    index = 0;
    render();
  });
  input.addEventListener("keydown", (event) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (matches.length) index = (index + (event.key === "ArrowDown" ? 1 : -1) + matches.length) % matches.length;
      render();
    } else if (event.key === "Enter") {
      const page = matches[index];
      if (page) {
        close();
        open(page.id);
      }
    }
  });
  render();
  input.focus();
}

export function openTemplates(use: (template: Template) => void): void {
  const list = el("div", { class: "template-list" });
  const close = openModal("Modèles", el("div", { class: "templates" }, el("h2", {}, "Modèles"), el("p", { class: "muted" }, "Créez une page à partir d'un modèle."), list));
  for (const template of TEMPLATES) {
    const card = el(
      "button",
      { type: "button", class: "template-card" },
      el("span", { class: "template-icon", "aria-hidden": "true" }, template.icon),
      el("span", { class: "template-text" }, el("span", { class: "template-name" }, template.name), el("span", { class: "template-desc" }, template.description)),
    );
    card.addEventListener("click", () => {
      close();
      use(template);
    });
    list.append(card);
  }
  list.querySelector<HTMLButtonElement>("button")?.focus();
}

export interface TrashActions {
  load(): Promise<PageSummary[]>;
  open(id: string): void;
  restore(id: string): Promise<void>;
  destroy(id: string): Promise<void>;
}

export function openTrash(actions: TrashActions): void {
  const input = el("input", { class: "search-input", type: "search", placeholder: "Filtrer par titre", "aria-label": "Filtrer la corbeille" });
  const list = el("div", { class: "trash-list" });
  const close = openModal("Corbeille", el("div", { class: "trash" }, el("div", { class: "modal-head" }, svgIcon("trash", 16), "Corbeille"), el("div", { class: "search-bar" }, svgIcon("search", 18), input), list), "modal-trash");
  let pages: PageSummary[] = [];
  const render = (): void => {
    const q = normalize(input.value.trim());
    const shown = pages.filter((p) => normalize(pageLabel(p)).includes(q));
    list.replaceChildren();
    if (shown.length === 0) list.append(el("div", { class: "search-empty" }, pages.length ? "Aucun résultat" : "Aucune page dans la corbeille"));
    for (const page of shown) {
      const restore = iconButton("restore", "Restaurer", "icon-btn");
      restore.addEventListener("click", async (event) => {
        event.stopPropagation();
        await actions.restore(page.id);
        await reload();
      });
      const destroy = iconButton("trash", "Supprimer définitivement", "icon-btn");
      destroy.addEventListener("click", async (event) => {
        event.stopPropagation();
        if (!window.confirm(`Supprimer définitivement « ${pageLabel(page)} » et ses sous-pages ?`)) return;
        await actions.destroy(page.id);
        await reload();
      });
      const row = el(
        "div",
        { class: "trash-item", "data-page": page.id },
        pageIcon(page),
        el("span", { class: "trash-text" }, el("span", { class: "search-title" }, pageLabel(page)), el("span", { class: "search-path" }, page.trashedAt ? `Supprimée le ${formatDate(page.trashedAt)}` : "")),
        el("span", { class: "trash-actions" }, restore, destroy),
      );
      row.addEventListener("click", () => {
        close();
        actions.open(page.id);
      });
      list.append(row);
    }
  };
  const reload = async (): Promise<void> => {
    pages = await actions.load();
    render();
  };
  input.addEventListener("input", render);
  list.append(el("div", { class: "search-empty" }, "Chargement…"));
  void reload();
  input.focus();
}

const EMOJIS = [
  "📄", "📝", "📌", "📎", "📚", "📔", "📒", "📊", "📈", "🗂️", "🗒️", "📅",
  "✅", "☑️", "⭐", "🔥", "💡", "🎯", "🚀", "🏁", "🧭", "🛠️", "⚙️", "🔧",
  "🏠", "🏢", "🌍", "🌱", "🌳", "🌸", "☀️", "🌙", "⚡", "❄️", "🌈", "🍀",
  "😀", "😎", "🤓", "🤔", "🙌", "👋", "👀", "💬", "❤️", "🎉", "🎨", "🎵",
  "🍎", "☕", "🍕", "🧩", "🎲", "🏆", "🧪", "🔬", "💻", "⌨️", "📱", "🔒",
];

export function openEmojiPicker(anchor: HTMLElement, pick: (emoji: string | null) => void): void {
  const grid = el("div", { class: "emoji-grid" });
  const random = el("button", { type: "button", class: "text-btn" }, svgIcon("shuffle", 14), "Aléatoire");
  const remove = el("button", { type: "button", class: "text-btn" }, "Retirer");
  const body = el("div", { class: "emoji-picker" }, el("div", { class: "picker-head" }, el("span", {}, "Icône"), random, remove), grid);
  const close = openPopover(anchor, body, "emoji-popover");
  const choose = (emoji: string | null): void => {
    close();
    pick(emoji);
  };
  for (const emoji of EMOJIS) {
    const button = el("button", { type: "button", class: "emoji", "aria-label": `Icône ${emoji}` }, emoji);
    button.addEventListener("click", () => choose(emoji));
    grid.append(button);
  }
  random.addEventListener("click", () => choose(EMOJIS[Math.floor(Math.random() * EMOJIS.length)] ?? "📄"));
  remove.addEventListener("click", () => choose(null));
}

export const COVER_LABELS: Record<CoverKey, string> = {
  sunset: "Coucher de soleil",
  ocean: "Océan",
  forest: "Forêt",
  dusk: "Crépuscule",
  sand: "Sable",
  slate: "Ardoise",
};

export const COVERS = Object.keys(COVER_LABELS) as CoverKey[];

export function openCoverPicker(anchor: HTMLElement, pick: (cover: CoverKey | null) => void): void {
  const grid = el("div", { class: "cover-grid" });
  const remove = el("button", { type: "button", class: "text-btn" }, "Retirer");
  const close = openPopover(anchor, el("div", { class: "cover-picker" }, el("div", { class: "picker-head" }, el("span", {}, "Couverture"), remove), grid), "cover-popover");
  for (const cover of COVERS) {
    const swatch = el("button", { type: "button", class: `cover-swatch cover-${cover}`, "aria-label": COVER_LABELS[cover], title: COVER_LABELS[cover] });
    swatch.addEventListener("click", () => {
      close();
      pick(cover);
    });
    grid.append(swatch);
  }
  remove.addEventListener("click", () => {
    close();
    pick(null);
  });
}
