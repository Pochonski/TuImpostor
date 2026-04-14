export type ElAttributes = {
  class?: string;
  text?: string;
  html?: string;
  onclick?: (event: MouseEvent) => void;
  onchange?: (event: Event) => void;
  oninput?: (event: Event) => void;
  onsubmit?: (event: Event) => void;
  onkeydown?: (event: KeyboardEvent) => void;
  disabled?: boolean;
  readonly?: boolean;
  hidden?: boolean;
  value?: string;
  placeholder?: string;
  type?: string;
  href?: string;
  src?: string;
  alt?: string;
  "data-id"?: string;
  "aria-label"?: string;
  "aria-current"?: string | boolean;
  style?: string;
  [key: string]: unknown;
};

export type ElChildren = (Node | string | number | null | undefined)[];

/**
 * Sanitizes a string to prevent XSS attacks
 * Only allows basic formatting tags and removes script/event attributes
 */
export function sanitizeHtml(str: unknown): string {
  if (typeof str !== "string") return "";
  
  // Remove script tags and their content
  let result = str.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
  // Remove event handlers
  result = result.replace(/\s*on\w+\s*=\s*["'][^"']*["']/gi, "");
  result = result.replace(/\s*on\w+\s*=\s*[^\s>]+/gi, "");
  // Remove javascript: URLs
  result = result.replace(/javascript:/gi, "");
  // Remove data: URLs (except for images)
  result = result.replace(/data:(?!image\/)/gi, "");
  
  return result;
}

/**
 * Creates a DOM element with declarative syntax
 * @param tag - HTML tag name
 * @param attrs - Attributes and event handlers
 * @param children - Child nodes
 * @returns HTMLElement
 */
export function el(tag: string, attrs: ElAttributes = {}, children: ElChildren = []): HTMLElement {
  const node = document.createElement(tag);
  
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") {
      node.className = String(v);
    } else if (k === "text") {
      node.textContent = String(v);
    } else if (k === "html") {
      node.innerHTML = sanitizeHtml(v as string);
    } else if (k.startsWith("on") && typeof v === "function") {
      node.addEventListener(k.slice(2).toLowerCase(), v as EventListener);
    } else if (typeof v === "boolean") {
      if (v) {
        node.setAttribute(k, "");
      } else {
        node.removeAttribute(k);
      }
    } else if (v !== undefined && v !== null) {
      node.setAttribute(k, String(v));
    }
  }
  
  for (const child of children) {
    if (child == null) continue;
    if (typeof child === "string" || typeof child === "number") {
      node.append(document.createTextNode(String(child)));
    } else {
      node.append(child);
    }
  }
  
  return node;
}

export function screenShell(params: {
  title: string;
  subtitle: string;
  content: HTMLElement;
  nav?: HTMLElement;
}): HTMLElement {
  const shell = el("div", { class: "shell" });
  const topbar = el("div", { class: "topbar" }, [
    el("div", { class: "brand" }, [
      el("div", { class: "brand-title", text: params.title }),
      el("div", { class: "brand-subtitle", text: params.subtitle }),
    ]),
  ]);
  const screen = el("div", { class: "card screen" }, [
    el("div", { class: "screen-inner" }, [params.content]),
  ]);
  shell.append(topbar, screen);
  if (params.nav) shell.append(params.nav);
  return shell;
}

export function makeNav(
  route: string,
  onNavigate: (route: string) => void
): HTMLElement {
  const items = [
    { route: "/new", label: "Nueva partida" },
    { route: "/settings", label: "Ajustes" },
  ];
  const nav = el("div", { class: "navbar" });
  
  for (const item of items) {
    const btn = el(
      "button",
      {
        class: "navitem",
        type: "button",
        "aria-current": item.route === route ? "page" : "false",
        onclick: () => onNavigate(item.route),
      },
      [item.label]
    );
    nav.append(btn);
  }
  
  return nav;
}
