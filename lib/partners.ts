// lib/partners.ts
import { readdir } from 'node:fs/promises';
import { join } from 'node:path';

export interface Partner {
  name: string;
  logo: string;
  href?: string;
}

const FOLDER = 'images/collaboration';
const IMAGE_EXT = /\.(png|jpe?g|webp|svg|avif)$/i;

const links: Record<string, string> = {
  // 'nama-sponsor.png': 'https://contoh.com',
};

function toName(file: string) {
  return file
    .replace(IMAGE_EXT, '')
    .replace(/^\d+[-_ ]*/, '')
    .replace(/[-_]+/g, ' ')
    .trim();
}

export async function getPartners(): Promise<Partner[]> {
  try {
    const files = await readdir(join(process.cwd(), 'public', FOLDER));

    return files
      .filter((file) => IMAGE_EXT.test(file))
      .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
      .map((file) => ({
        name: toName(file),
        logo: `/${FOLDER}/${file}`,
        href: links[file],
      }));
  } catch {
    return [];
  }
}
