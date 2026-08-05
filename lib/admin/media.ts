import 'server-only';
import path from 'node:path';

/**
 * Каталог загруженных медиа. На Render для постоянного хранения нужен
 * persistent disk (указать DATA_DIR на него) или S3/CDN (Том 0, п. 0.4).
 * Здесь — файлы на диске под DATA_DIR/uploads, отдаются через /media/<file>.
 */
export const DATA_DIR = process.env.DATA_DIR || path.join(process.cwd(), '.data');
export const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');

const EXT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.gif': 'image/gif',
};

export function contentTypeFor(name: string): string {
  return EXT_TYPES[path.extname(name).toLowerCase()] ?? 'application/octet-stream';
}

export function isAllowedImage(name: string): boolean {
  return path.extname(name).toLowerCase() in EXT_TYPES;
}

/** Безопасное имя файла: только базовое имя, без путей. */
export function safeName(name: string): string {
  return path.basename(name).replace(/[^\w.\-]+/g, '_');
}
