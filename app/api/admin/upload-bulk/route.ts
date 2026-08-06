import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { isAuthed } from '@/lib/admin/auth';
import { writeData, logAction } from '@/lib/admin/store';
import { allProducts } from '@/lib/catalog';
import { UPLOADS_DIR, isAllowedImage, safeName } from '@/lib/admin/media';
import { revalidatePath } from 'next/cache';

/**
 * Массовая загрузка фото по артикулам (Том 7, п. 7.3). Заливаете много файлов
 * «дозами» — система раскладывает по sku из имени файла. Имя вида
 * «MSH-120-40.jpg» или «MSH-120-40-2.jpg» (несколько фото одного товара).
 */
function skuFromFilename(name: string, known: Set<string>): string | null {
  const base = name.replace(/\.[^.]+$/, '').trim(); // без расширения
  if (known.has(base)) return base;
  // убрать хвост -1 / _2 (порядковый номер фото)
  const trimmed = base.replace(/[-_]\d+$/, '');
  if (known.has(trimmed)) return trimmed;
  // без учёта регистра
  const up = base.toUpperCase();
  for (const s of known) if (s.toUpperCase() === up || s.toUpperCase() === trimmed.toUpperCase()) return s;
  return null;
}

export async function POST(request: Request) {
  if (!isAuthed()) return NextResponse.redirect(new URL('/admin/login', request.url), { status: 303 });

  const form = await request.formData();
  const files = form.getAll('files').filter((f): f is File => f instanceof File && f.size > 0);
  if (files.length === 0) {
    return NextResponse.redirect(new URL('/admin/products?bulkphoto=nofile', request.url), { status: 303 });
  }

  const known = new Set(allProducts().map((p) => p.sku));
  const bySku: Record<string, string[]> = {};
  let matched = 0;
  let unmatched = 0;

  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    for (const file of files) {
      if (!isAllowedImage(file.name)) {
        unmatched++;
        continue;
      }
      const sku = skuFromFilename(file.name, known);
      if (!sku) {
        unmatched++;
        continue;
      }
      const stamp = Date.now().toString(36) + Math.floor(performance.now()).toString(36);
      const fname = `${safeName(sku)}-${stamp}-${safeName(file.name)}`;
      const buf = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(path.join(UPLOADS_DIR, fname), buf);
      (bySku[sku] ??= []).push(`/media/${fname}`);
      matched++;
    }

    writeData((d) => {
      for (const [sku, urls] of Object.entries(bySku)) {
        const cur = d.productOverlays[sku] ?? {};
        d.productOverlays[sku] = { ...cur, media: [...(cur.media ?? []), ...urls] };
      }
    });
    logAction('Контент-менеджер', `Массовая загрузка фото: привязано ${matched}, без пары ${unmatched}`);
    revalidatePath('/', 'layout');
  } catch {
    return NextResponse.redirect(new URL('/admin/products?bulkphoto=err', request.url), { status: 303 });
  }

  return NextResponse.redirect(
    new URL(`/admin/products?bulkphoto=ok&m=${matched}&u=${unmatched}`, request.url),
    { status: 303 },
  );
}
