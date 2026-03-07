import { el } from "../dom/el.js";

export function viewNotFound({ onNavigate }) {
  const content = el("div", {}, [
    el("h1", { class: "h1", text: "404" }),
    el("p", { class: "p", text: "Página no encontrada" }),
    el("div", { class: "actions" }, [
      el("button", {
        class: "btn btn-primary",
        type: "button",
        onclick: () => onNavigate("/"),
      }, ["Ir al inicio"]),
    ]),
  ]);
  return { title: "TúImpostor", subtitle: "404", content };
}
