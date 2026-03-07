export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(attrs)) {
    if (k === "class") node.className = v;
    else if (k === "text") node.textContent = v;
    else if (k === "html") node.innerHTML = v;
    else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (typeof v === "boolean") {
      if (v) node.setAttribute(k, "");
      else node.removeAttribute(k);
    } else node.setAttribute(k, String(v));
  }
  for (const child of children) {
    if (child == null) continue;
    node.append(child?.nodeType ? child : document.createTextNode(String(child)));
  }
  return node;
}

export function screenShell({ title, subtitle, content, nav }) {
  const shell = el("div", { class: "shell" });
  const topbar = el("div", { class: "topbar" }, [
    el("div", { class: "brand" }, [
      el("div", { class: "brand-title", text: title }),
      el("div", { class: "brand-subtitle", text: subtitle }),
    ]),
  ]);
  const screen = el("div", { class: "card screen" }, [
    el("div", { class: "screen-inner" }, [content]),
  ]);
  shell.append(topbar, screen);
  if (nav) shell.append(nav);
  return shell;
}

export function makeNav(route, onNavigate) {
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
