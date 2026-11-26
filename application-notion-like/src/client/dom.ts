import { ICONS, type IconName } from "./icons.js";

export const $ = <T extends HTMLElement>(id: string): T => document.getElementById(id) as T;

type Child = Node | string | null | undefined | false;

export function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  props: Partial<Record<string, string>> = {},
  ...children: Child[]
): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(props)) {
    if (value !== undefined) node.setAttribute(key, value);
  }
  for (const child of children) if (child !== null && child !== undefined && child !== false) node.append(child);
  return node;
}

/** Icône Lucide en SVG inline (contenu statique de icons.ts, jamais de texte saisi). */
export function svgIcon(name: IconName, size = 16): SVGSVGElement {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("width", String(size));
  svg.setAttribute("height", String(size));
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("icon");
  svg.innerHTML = ICONS[name];
  return svg;
}

export function iconButton(name: IconName, label: string, className = "icon-btn"): HTMLButtonElement {
  const button = el("button", { type: "button", class: className, "aria-label": label, title: label });
  button.append(svgIcon(name));
  return button;
}

export function toast(message: string): void {
  const node = $("toast");
  node.textContent = message;
  node.classList.add("show");
  window.setTimeout(() => node.classList.remove("show"), 4000);
}

export const formatDate = (iso: string): string =>
  new Date(iso).toLocaleString("fr-FR", { dateStyle: "medium", timeStyle: "short" });

export function uid(): string {
  if (typeof crypto.randomUUID === "function") return crypto.randomUUID();
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Popover positionné sous un élément ; se ferme au clic extérieur ou avec Échap. */
export function openPopover(anchor: HTMLElement, content: HTMLElement, className = ""): () => void {
  closePopovers();
  const pop = el("div", { class: `popover ${className}`.trim(), role: "dialog" }, content);
  document.body.append(pop);
  const rect = anchor.getBoundingClientRect();
  const top = Math.min(rect.bottom + 4, window.innerHeight - pop.offsetHeight - 8);
  const left = Math.min(rect.left, window.innerWidth - pop.offsetWidth - 8);
  pop.style.top = `${Math.max(8, top)}px`;
  pop.style.left = `${Math.max(8, left)}px`;
  const close = (): void => {
    pop.remove();
    document.removeEventListener("mousedown", onDown, true);
    document.removeEventListener("keydown", onKey, true);
  };
  const onDown = (event: MouseEvent): void => {
    if (!pop.contains(event.target as Node) && !anchor.contains(event.target as Node)) close();
  };
  const onKey = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
      event.stopPropagation();
      close();
      anchor.focus();
    }
  };
  document.addEventListener("mousedown", onDown, true);
  document.addEventListener("keydown", onKey, true);
  (pop as HTMLElement & { closePopover?: () => void }).closePopover = close;
  return close;
}

export function closePopovers(): void {
  for (const pop of document.querySelectorAll<HTMLElement & { closePopover?: () => void }>(".popover")) {
    pop.closePopover?.();
  }
}

export interface MenuItem {
  label: string;
  icon?: IconName;
  danger?: boolean;
  run: () => void;
}

/** Menu contextuel simple (liste d'actions), utilisé par la poignée ⋮⋮ et la barre latérale. */
export function openMenu(anchor: HTMLElement, items: (MenuItem | "separator" | string)[]): void {
  const list = el("div", { class: "menu", role: "menu" });
  let close = (): void => undefined;
  for (const item of items) {
    if (item === "separator") {
      list.append(el("div", { class: "menu-separator" }));
    } else if (typeof item === "string") {
      list.append(el("div", { class: "menu-label" }, item));
    } else {
      const button = el("button", { type: "button", role: "menuitem", class: `menu-item${item.danger ? " danger" : ""}` });
      if (item.icon) button.append(svgIcon(item.icon));
      button.append(el("span", {}, item.label));
      button.addEventListener("click", () => {
        close();
        item.run();
      });
      list.append(button);
    }
  }
  close = openPopover(anchor, list, "menu-popover");
  list.querySelector<HTMLButtonElement>(".menu-item")?.focus();
  list.addEventListener("keydown", (event) => {
    const buttons = [...list.querySelectorAll<HTMLButtonElement>(".menu-item")];
    const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
    if (event.key === "ArrowDown") buttons[(index + 1) % buttons.length]?.focus();
    else if (event.key === "ArrowUp") buttons[(index - 1 + buttons.length) % buttons.length]?.focus();
    else return;
    event.preventDefault();
  });
}
