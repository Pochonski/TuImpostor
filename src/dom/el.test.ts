import { describe, it, expect } from "vitest";
import { el, sanitizeHtml } from "./el.js";

describe("el function", () => {
  it("should create a simple element", () => {
    const div = el("div");
    expect(div.tagName).toBe("DIV");
  });

  it("should set class attribute", () => {
    const div = el("div", { class: "test-class" });
    expect(div.className).toBe("test-class");
  });

  it("should set text content", () => {
    const div = el("div", { text: "Hello World" });
    expect(div.textContent).toBe("Hello World");
  });

  it("should set data attributes", () => {
    const div = el("div", { "data-id": "123" });
    expect(div.getAttribute("data-id")).toBe("123");
  });

  it("should add event listeners", () => {
    let clicked = false;
    const button = el("button", {
      onclick: () => {
        clicked = true;
      },
    });
    button.click();
    expect(clicked).toBe(true);
  });

  it("should handle boolean attributes", () => {
    const input = el("input", { disabled: true, readonly: false });
    expect(input.getAttribute("disabled")).toBe("");
    expect(input.getAttribute("readonly")).toBe(null);
  });

  it("should add children", () => {
    const parent = el("div", {}, [
      el("span", { text: "child1" }),
      el("span", { text: "child2" }),
    ]);
    expect(parent.children.length).toBe(2);
  });

  it("should handle html attribute with sanitization", () => {
    const div = el("div", { html: "<b>Bold</b>" });
    expect(div.innerHTML).toBe("<b>Bold</b>");
  });

  it("should strip script tags from html", () => {
    const div = el("div", { html: '<p>Safe</p><script>alert("xss")</script>' });
    expect(div.innerHTML).not.toContain("script");
    expect(div.innerHTML).toContain("Safe");
  });

  it("should handle null/undefined children", () => {
    const div = el("div", {}, [null, undefined]);
    expect(div.children.length).toBe(0);
  });
});

describe("sanitizeHtml function", () => {
  it("should return empty string for non-string input", () => {
    expect(sanitizeHtml(null as never)).toBe("");
    expect(sanitizeHtml(undefined as never)).toBe("");
  });

  it("should remove script tags", () => {
    const result = sanitizeHtml('<p>Test</p><script>alert("xss")</script>');
    expect(result).not.toContain("script");
    expect(result).toContain("Test");
  });

  it("should remove event handlers", () => {
    const result = sanitizeHtml('<div onclick="alert(1)">Test</div>');
    expect(result).not.toContain("onclick");
  });

  it("should remove javascript: URLs", () => {
    const result = sanitizeHtml('<a href="javascript:alert(1)">Link</a>');
    expect(result).not.toContain("javascript:");
  });
});
