// lib/export-text.ts
const EMOJI_PATTERN = /[\p{Extended_Pictographic}\p{Emoji_Modifier}\u{1F1E6}-\u{1F1FF}\u{E0020}-\u{E007F}⃣︎️‍]/gu;

export function removeEmoji(text: string): string {
  return text.replace(EMOJI_PATTERN, '').replace(/\s+/g, ' ').trim();
}

export function exportName(name: string): string {
  return removeEmoji(name)
    .toLowerCase()
    .replace(/(^|[\s\-'])(\p{L})/gu, (_, sep: string, letter: string) => sep + letter.toUpperCase());
}
