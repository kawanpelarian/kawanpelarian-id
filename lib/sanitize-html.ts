// lib/sanitize-html.ts
import sanitize from "sanitize-html";

export function sanitizeHtml(html: string): string {
  return sanitize(html, {
    allowedTags: ["p", "strong", "em", "u", "s", "ul", "ol", "li", "br", "h1", "h2", "h3"],
    allowedAttributes: {},
  });
}