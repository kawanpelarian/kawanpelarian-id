// lib/sanitize-html.ts
import DOMPurify from 'isomorphic-dompurify';

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'strong', 'em', 'u', 's', 'ul', 'ol', 'li', 'br', 'h1', 'h2', 'h3'],
    ALLOWED_ATTR: [],
  });
}
