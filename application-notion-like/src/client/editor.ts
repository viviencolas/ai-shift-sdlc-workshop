import type { Block, BlockType } from "../shared/types.js";
import { el, iconButton, openMenu, svgIcon, uid } from "./dom.js";
import {
  CONTINUING_TYPES,
  convertBlock,
  detectShortcut,
  filterSlashItems,
  makeBlock,
  moveItem,
  numberedIndex,
  SLASH_ITEMS,
  type SlashItem,
} from "./shortcuts.js";

type Field = "text" | "body";
type CaretTarget = "start" | "end" | number;

const PLACEHOLDERS: Partial<Record<BlockType, string>> = {
  heading_1: "Titre 1",
  heading_2: "Titre 2",
  heading_3: "Titre 3",
  bulleted_list: "Liste",
  numbered_list: "Liste",
  todo: "À faire",
  toggle: "Bascule",
  quote: "Citation",
  callout: "Écrivez quelque chose…",
  code: "Code",
};
const CALLOUT_ICONS = ["💡", "⚠️", "📌", "✅", "❗", "ℹ️"];

function readText(node: HTMLElement): string {
  const text = node.innerText;
  return text === "\n" ? "" : text;
}

function getCaret(node: HTMLElement): number {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return 0;
  const range = sel.getRangeAt(0);
  if (!node.contains(range.startContainer)) return 0;
  const pre = range.cloneRange();
  pre.selectNodeContents(node);
  pre.setEnd(range.startContainer, range.startOffset);
  return pre.toString().length;
}

function setCaret(node: HTMLElement, target: CaretTarget): void {
  node.focus();
  const sel = window.getSelection();
  if (!sel) return;
  const total = node.textContent?.length ?? 0;
  let offset = target === "start" ? 0 : target === "end" ? total : Math.min(target, total);
  const range = document.createRange();
  const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
  let current = walker.nextNode();
  while (current) {
    const length = current.textContent?.length ?? 0;
    if (offset <= length) {
      range.setStart(current, offset);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      return;
    }
    offset -= length;
    current = walker.nextNode();
  }
  range.selectNodeContents(node);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}

function makeEditable(node: HTMLElement): void {
  try {
    node.contentEditable = "plaintext-only";
  } catch {
    node.contentEditable = "true";
  }
  if (node.contentEditable !== "plaintext-only") node.contentEditable = "true";
}

interface SlashState {
  blockId: string;
  start: number;
  index: number;
  items: SlashItem[];
  menu: HTMLElement;
}

/**
 * Éditeur de blocs : une ligne par bloc, texte brut éditable (jamais de HTML saisi).
 * Les changements de structure re-rendent la liste ; la frappe met seulement l'état à jour.
 */
export class BlockEditor {
  readonly root: HTMLElement;
  private blocks: Block[];
  private readonly openToggles = new Set<string>();
  private slash: SlashState | null = null;
  private dragId: string | null = null;

  constructor(
    blocks: Block[],
    private readonly onChange: (blocks: Block[]) => void,
    private readonly readOnly = false,
  ) {
    this.blocks = blocks.map((b) => ({ ...b }));
    this.root = el("div", { class: "editor", role: "textbox", "aria-multiline": "true", "aria-label": "Contenu de la page" });
    this.render();
  }

  /** Place le curseur dans le premier bloc (en le créant si la page est vide). */
  focusFirst(): void {
    if (this.readOnly) return;
    if (this.blocks.length === 0) this.insertAt(0, makeBlock(uid(), "paragraph"));
    const first = this.blocks[0];
    if (first) this.focusBlock(first.id, "start");
  }

  /** Clic sous le dernier bloc : focalise un paragraphe vide final, ou en ajoute un. */
  focusEnd(): void {
    if (this.readOnly) return;
    const last = this.blocks[this.blocks.length - 1];
    if (last && last.type === "paragraph" && last.text === "") {
      this.focusBlock(last.id, "start");
      return;
    }
    const block = makeBlock(uid(), "paragraph");
    this.insertAt(this.blocks.length, block);
    this.focusBlock(block.id, "start");
  }

  private emit(): void {
    this.onChange(this.blocks.map((b) => ({ ...b })));
  }

  private indexOf(id: string): number {
    return this.blocks.findIndex((b) => b.id === id);
  }

  private find(id: string): Block | undefined {
    return this.blocks.find((b) => b.id === id);
  }

  private insertAt(index: number, block: Block): void {
    this.blocks.splice(index, 0, block);
    if (block.type === "toggle") this.openToggles.add(block.id);
    this.render();
    this.emit();
  }

  private replace(id: string, block: Block): void {
    const index = this.indexOf(id);
    if (index < 0) return;
    this.blocks[index] = block;
    if (block.type === "toggle") this.openToggles.add(block.id);
  }

  private remove(id: string): void {
    this.blocks = this.blocks.filter((b) => b.id !== id);
    this.render();
    this.emit();
  }

  private move(id: string, delta: number): void {
    const index = this.indexOf(id);
    const target = index + delta;
    if (index < 0 || target < 0 || target >= this.blocks.length) return;
    this.blocks = moveItem(this.blocks, index, target);
    this.render();
    this.emit();
    this.focusBlock(id, "end");
  }

  private focusBlock(id: string, target: CaretTarget): void {
    const row = this.root.querySelector<HTMLElement>(`[data-id="${CSS.escape(id)}"]`);
    const editable = row?.querySelector<HTMLElement>('.editable[data-field="text"]');
    if (editable) setCaret(editable, target);
    else row?.querySelector<HTMLElement>(".divider-wrap")?.focus();
  }

  render(): void {
    this.closeSlash();
    this.root.replaceChildren(...this.blocks.map((block, index) => this.renderBlock(block, index)));
  }

  private renderBlock(block: Block, index: number): HTMLElement {
    const row = el("div", { class: `block block-${block.type}`, "data-id": block.id, "data-type": block.type });
    if (!this.readOnly) row.append(this.renderControls(block, row));
    const content = el("div", { class: "block-content" });
    row.append(content);

    if (block.type === "divider") {
      const wrap = el("div", { class: "divider-wrap", tabindex: this.readOnly ? "-1" : "0", "aria-label": "Séparateur" }, el("hr"));
      wrap.addEventListener("keydown", (event) => {
        if (event.key === "Backspace" || event.key === "Delete") {
          event.preventDefault();
          const prev = this.blocks[index - 1];
          this.remove(block.id);
          if (prev) this.focusBlock(prev.id, "end");
        } else if (event.key === "Enter") {
          event.preventDefault();
          const next = makeBlock(uid(), "paragraph");
          this.insertAt(index + 1, next);
          this.focusBlock(next.id, "start");
        }
      });
      content.append(wrap);
      return row;
    }

    if (block.type === "bulleted_list") content.append(el("span", { class: "block-marker", "aria-hidden": "true" }, "•"));
    if (block.type === "numbered_list") {
      content.append(el("span", { class: "block-marker", "aria-hidden": "true" }, `${numberedIndex(this.blocks, index)}.`));
    }
    if (block.type === "todo") {
      const box = el("button", {
        type: "button",
        class: `todo-box${block.checked ? " checked" : ""}`,
        role: "checkbox",
        "aria-checked": String(block.checked === true),
        "aria-label": "Fait",
      });
      if (block.checked) box.append(svgIcon("check", 12));
      box.disabled = this.readOnly;
      box.addEventListener("click", () => {
        block.checked = !block.checked;
        this.render();
        this.emit();
      });
      content.append(box);
      if (block.checked) row.classList.add("checked");
    }
    if (block.type === "toggle") {
      const open = this.openToggles.has(block.id);
      const arrow = el("button", {
        type: "button",
        class: `toggle-arrow${open ? " open" : ""}`,
        "aria-expanded": String(open),
        "aria-label": open ? "Replier" : "Déplier",
      });
      arrow.append(svgIcon("chevronRight", 14));
      arrow.addEventListener("click", () => {
        if (open) this.openToggles.delete(block.id);
        else this.openToggles.add(block.id);
        this.render();
      });
      content.append(arrow);
    }
    if (block.type === "callout") {
      const icon = el("button", { type: "button", class: "callout-icon", "aria-label": "Changer l'icône de l'encadré" }, block.icon ?? "💡");
      icon.disabled = this.readOnly;
      icon.addEventListener("click", () => {
        const next = CALLOUT_ICONS[(CALLOUT_ICONS.indexOf(block.icon ?? "") + 1) % CALLOUT_ICONS.length];
        block.icon = next ?? "💡";
        icon.textContent = block.icon;
        this.emit();
      });
      content.append(icon);
    }

    const main = el("div", { class: "block-main" });
    main.append(this.editable(block, "text", PLACEHOLDERS[block.type] ?? "Appuyez sur « / » pour les commandes"));
    if (block.type === "toggle" && this.openToggles.has(block.id)) {
      main.append(this.editable(block, "body", "Contenu de la bascule"));
    }
    content.append(main);
    return row;
  }

  private renderControls(block: Block, row: HTMLElement): HTMLElement {
    const add = iconButton("plus", "Ajouter un bloc en dessous", "block-btn block-add");
    add.addEventListener("click", () => {
      const next = makeBlock(uid(), "paragraph", "/");
      this.insertAt(this.indexOf(block.id) + 1, next);
      const editable = this.root.querySelector<HTMLElement>(`[data-id="${CSS.escape(next.id)}"] .editable`);
      if (editable) {
        setCaret(editable, "end");
        this.openSlash(next.id, 0, editable);
      }
    });
    const handle = iconButton("grip", "Glisser pour déplacer, cliquer pour ouvrir le menu", "block-btn block-handle");
    handle.draggable = true;
    handle.addEventListener("click", () => this.openBlockMenu(block.id, handle));
    handle.addEventListener("dragstart", (event) => {
      this.dragId = block.id;
      event.dataTransfer?.setData("text/plain", block.id);
      if (event.dataTransfer) event.dataTransfer.effectAllowed = "move";
      event.dataTransfer?.setDragImage(row, 0, 0);
      row.classList.add("dragging");
    });
    handle.addEventListener("dragend", () => {
      this.dragId = null;
      this.root.querySelectorAll(".dragging, .drop-before, .drop-after").forEach((n) => n.classList.remove("dragging", "drop-before", "drop-after"));
    });
    row.addEventListener("dragover", (event) => {
      if (!this.dragId || this.dragId === block.id) return;
      event.preventDefault();
      const rect = row.getBoundingClientRect();
      const before = event.clientY < rect.top + rect.height / 2;
      row.classList.toggle("drop-before", before);
      row.classList.toggle("drop-after", !before);
    });
    row.addEventListener("dragleave", () => row.classList.remove("drop-before", "drop-after"));
    row.addEventListener("drop", (event) => {
      event.preventDefault();
      const id = this.dragId;
      const before = row.classList.contains("drop-before");
      row.classList.remove("drop-before", "drop-after");
      if (!id || id === block.id) return;
      const from = this.indexOf(id);
      let to = this.indexOf(block.id) + (before ? 0 : 1);
      if (from < to) to -= 1;
      this.blocks = moveItem(this.blocks, from, to);
      this.render();
      this.emit();
    });
    return el("div", { class: "block-controls" }, add, handle);
  }

  private openBlockMenu(id: string, anchor: HTMLElement): void {
    const index = this.indexOf(id);
    const block = this.blocks[index];
    if (!block) return;
    openMenu(anchor, [
      { label: "Supprimer", icon: "trash", danger: true, run: () => this.remove(id) },
      {
        label: "Dupliquer",
        icon: "copy",
        run: () => {
          const copy = { ...block, id: uid() };
          this.insertAt(index + 1, copy);
          this.focusBlock(copy.id, "end");
        },
      },
      { label: "Monter", icon: "arrowUp", run: () => this.move(id, -1) },
      { label: "Descendre", icon: "arrowDown", run: () => this.move(id, 1) },
      "separator",
      "Transformer en",
      ...SLASH_ITEMS.filter((item) => item.type !== "divider" && item.type !== block.type).map((item) => ({
        label: item.label,
        icon: item.icon,
        run: () => {
          this.replace(id, convertBlock(block, item.type));
          this.render();
          this.emit();
          this.focusBlock(id, "end");
        },
      })),
    ]);
  }

  private editable(block: Block, field: Field, placeholder: string): HTMLElement {
    const node = el("div", { class: "editable", "data-field": field, "data-placeholder": placeholder, spellcheck: "true" });
    node.textContent = (field === "text" ? block.text : block.body) ?? "";
    if (this.readOnly) return node;
    makeEditable(node);
    node.addEventListener("input", () => this.onInput(block.id, field, node));
    node.addEventListener("keydown", (event) => this.onKeyDown(event, block.id, field, node));
    node.addEventListener("paste", (event) => {
      event.preventDefault();
      document.execCommand("insertText", false, event.clipboardData?.getData("text/plain") ?? "");
    });
    node.addEventListener("blur", () => window.setTimeout(() => {
      if (this.slash && !this.slash.menu.contains(document.activeElement)) this.closeSlash();
    }, 150));
    return node;
  }

  private onInput(id: string, field: Field, node: HTMLElement): void {
    const block = this.find(id);
    if (!block) return;
    const text = readText(node);
    if (text === "" && node.childNodes.length > 0) node.replaceChildren();
    if (field === "body") {
      block.body = text;
      this.emit();
      return;
    }
    const shortcut = block.type === "paragraph" && !this.slash ? detectShortcut(text) : null;
    if (shortcut) {
      const converted = convertBlock({ ...block, text: shortcut.rest }, shortcut.type);
      this.replace(id, converted);
      if (shortcut.type === "divider") {
        const next = makeBlock(uid(), "paragraph");
        this.blocks.splice(this.indexOf(id) + 1, 0, next);
        this.render();
        this.emit();
        this.focusBlock(next.id, "start");
      } else {
        this.render();
        this.emit();
        this.focusBlock(id, "start");
      }
      return;
    }
    block.text = text;
    const caret = getCaret(node);
    if (this.slash && this.slash.blockId === id) {
      const query = text.slice(this.slash.start + 1, caret);
      if (caret <= this.slash.start || text[this.slash.start] !== "/" || /^\s|\s\s/.test(query) || query.length > 24) this.closeSlash();
      else this.updateSlash(query);
    } else if (text[caret - 1] === "/" && (caret === 1 || /\s/.test(text[caret - 2] ?? ""))) {
      this.openSlash(id, caret - 1, node);
    }
    this.emit();
  }

  private onKeyDown(event: KeyboardEvent, id: string, field: Field, node: HTMLElement): void {
    if (event.isComposing) return;
    if (this.slash && this.slash.blockId === id && this.onSlashKey(event)) return;
    const block = this.find(id);
    const index = this.indexOf(id);
    if (!block) return;

    if ((event.metaKey || event.ctrlKey) && event.shiftKey && (event.key === "ArrowUp" || event.key === "ArrowDown")) {
      event.preventDefault();
      this.move(id, event.key === "ArrowUp" ? -1 : 1);
      return;
    }
    if (field === "body") return;

    const sel = window.getSelection();
    const collapsed = sel?.isCollapsed ?? true;
    const caret = getCaret(node);
    const text = readText(node);

    if (event.key === "Enter" && !event.shiftKey) {
      if (block.type === "code") return;
      event.preventDefault();
      if (text === "" && block.type !== "paragraph" && !block.type.startsWith("heading")) {
        this.replace(id, convertBlock(block, "paragraph"));
        this.render();
        this.emit();
        this.focusBlock(id, "start");
        return;
      }
      block.text = text.slice(0, caret);
      const nextType: BlockType = CONTINUING_TYPES.includes(block.type) ? block.type : "paragraph";
      const next = makeBlock(uid(), nextType, text.slice(caret));
      this.insertAt(index + 1, next);
      this.focusBlock(next.id, "start");
      return;
    }

    if (event.key === "Backspace" && collapsed && caret === 0) {
      if (block.type !== "paragraph") {
        event.preventDefault();
        this.replace(id, convertBlock(block, "paragraph"));
        this.render();
        this.emit();
        this.focusBlock(id, "start");
        return;
      }
      const prev = this.blocks[index - 1];
      if (!prev) return;
      event.preventDefault();
      if (prev.type === "divider") {
        this.remove(prev.id);
        this.focusBlock(id, "start");
        return;
      }
      const join = prev.text.length;
      prev.text += text;
      this.remove(id);
      this.focusBlock(prev.id, join);
      return;
    }

    if (event.key === "ArrowUp" && caret === 0 && collapsed) {
      const prev = this.blocks[index - 1];
      if (prev) {
        event.preventDefault();
        this.focusBlock(prev.id, "end");
      }
    } else if (event.key === "ArrowDown" && caret === text.length && collapsed) {
      const next = this.blocks[index + 1];
      if (next) {
        event.preventDefault();
        this.focusBlock(next.id, "start");
      }
    }
  }

  private openSlash(blockId: string, start: number, node: HTMLElement): void {
    this.closeSlash();
    const menu = el("div", { class: "slash-menu", role: "listbox", "aria-label": "Types de blocs" });
    document.body.append(menu);
    this.slash = { blockId, start, index: 0, items: [...SLASH_ITEMS], menu };
    this.renderSlash();
    const sel = window.getSelection();
    const rect = sel && sel.rangeCount > 0 ? sel.getRangeAt(0).getBoundingClientRect() : node.getBoundingClientRect();
    const anchor = rect.height > 0 ? rect : node.getBoundingClientRect();
    const top = anchor.bottom + 6 + menu.offsetHeight > window.innerHeight ? anchor.top - menu.offsetHeight - 6 : anchor.bottom + 6;
    menu.style.top = `${Math.max(8, top)}px`;
    menu.style.left = `${Math.min(anchor.left, window.innerWidth - menu.offsetWidth - 8)}px`;
  }

  private updateSlash(query: string): void {
    if (!this.slash) return;
    this.slash.items = filterSlashItems(query);
    this.slash.index = 0;
    if (this.slash.items.length === 0 && query.length > 3) this.closeSlash();
    else this.renderSlash();
  }

  private renderSlash(): void {
    const slash = this.slash;
    if (!slash) return;
    slash.menu.replaceChildren(el("div", { class: "slash-label" }, "Blocs de base"));
    if (slash.items.length === 0) slash.menu.append(el("div", { class: "slash-empty" }, "Aucun résultat"));
    slash.items.forEach((item, i) => {
      const option = el(
        "div",
        { class: `slash-item${i === slash.index ? " active" : ""}`, role: "option", "aria-selected": String(i === slash.index), "data-type": item.type },
        el("span", { class: "slash-icon" }, svgIcon(item.icon, 20)),
        el("span", { class: "slash-text" }, el("span", { class: "slash-title" }, item.label), el("span", { class: "slash-desc" }, item.description)),
      );
      option.addEventListener("mousedown", (event) => {
        event.preventDefault();
        this.applySlash(item);
      });
      option.addEventListener("mousemove", () => {
        if (slash.index !== i) {
          slash.index = i;
          this.renderSlash();
        }
      });
      slash.menu.append(option);
    });
    slash.menu.querySelector(".slash-item.active")?.scrollIntoView({ block: "nearest" });
  }

  private onSlashKey(event: KeyboardEvent): boolean {
    const slash = this.slash;
    if (!slash) return false;
    const count = slash.items.length;
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      if (count > 0) slash.index = (slash.index + (event.key === "ArrowDown" ? 1 : -1) + count) % count;
      this.renderSlash();
      return true;
    }
    if (event.key === "Enter" || event.key === "Tab") {
      const item = slash.items[slash.index];
      if (!item) return false;
      event.preventDefault();
      this.applySlash(item);
      return true;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      this.closeSlash();
      return true;
    }
    return false;
  }

  private applySlash(item: SlashItem): void {
    const slash = this.slash;
    if (!slash) return;
    const block = this.find(slash.blockId);
    const node = this.root.querySelector<HTMLElement>(`[data-id="${CSS.escape(slash.blockId)}"] .editable[data-field="text"]`);
    this.closeSlash();
    if (!block || !node) return;
    const text = readText(node);
    const caret = Math.max(getCaret(node), slash.start + 1);
    const remaining = text.slice(0, slash.start) + text.slice(caret);
    const index = this.indexOf(block.id);
    if (remaining.trim() === "") {
      this.replace(block.id, convertBlock({ ...block, text: "" }, item.type));
      if (item.type === "divider") {
        const next = makeBlock(uid(), "paragraph");
        this.blocks.splice(index + 1, 0, next);
        this.render();
        this.emit();
        this.focusBlock(next.id, "start");
        return;
      }
      this.render();
      this.emit();
      this.focusBlock(block.id, "start");
      return;
    }
    block.text = remaining;
    const next = makeBlock(uid(), item.type);
    this.insertAt(index + 1, next);
    this.focusBlock(next.id, "start");
  }

  private closeSlash(): void {
    this.slash?.menu.remove();
    this.slash = null;
  }
}
