import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { isAuthed } from '@/lib/admin/auth';
import { writeData, logAction } from '@/lib/admin/store';
import { productBySku } from '@/lib/products';
import { UPLOADS_DIR, isAllowedImage, safeName } from '@/lib/admin/media';
import { revalidatePath } from 'next/cache';

/**
 * Загрузка маркетинговых фото товара (Том 0, п. 0.1: фото — зона сайта).
 * Сохраняет файл под DATA_DIR/uploads и добавляет ссылку в оверлей товара.
 */
export async function POST(request: Request) {
  if (!isAuthed()) return NextResponse.redirect(new URL('/admin/login', request.url), { status: 303 });

  const form = await request.formData();
  const sku = String(form.get('sku') ?? '');
  const catSlug = String(form.get('catSlug') ?? '');
  const isCategory = Boolean(catSlug);
  const back = isCategory ? `/admin/categories/${catSlug}` : `/admin/products/${sku}`;
  const file = form.get('file');

  if (!isCategory && (!sku || !productBySku(sku))) {
    return NextResponse.redirect(new URL('/admin/products', request.url), { status: 303 });
  }
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.redirect(new URL(`${back}?up=nofile`, request.url), { status: 303 });
  }
  if (!isAllowedImage(file.name)) {
    return NextResponse.redirect(new URL(`${back}?up=type`, request.url), { status: 303 });
  }

  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    const stamp = Date.now().toString(36);
    const key = isCategory ? `cat-${safeName(catSlug)}` : safeName(sku);
    const fname = `${key}-${stamp}-${safeName(file.name)}`;
    const buf = Buffer.from(await file.arrayBuffer());
    fs.writeFileSync(path.join(UPLOADS_DIR, fname), buf);
    const url = `/media/${fname}`;

    if (isCategory) {
      writeData((d) => {
        d.categoryOverlays[catSlug] = { ...(d.categoryOverlays[catSlug] ?? {}), bannerImage: url };
      });
      logAction('Контент-менеджер', `Загружен баннер категории ${catSlug}`);
      revalidatePath(`/catalog/${catSlug}`);
    } else {
      writeData((d) => {
        const cur = d.productOverlays[sku] ?? {};
        d.productOverlays[sku] = { ...cur, media: [...(cur.media ?? []), url] };
      });
      logAction('Контент-менеджер', `Загружено фото товара ${sku}`);
      const prod = productBySku(sku)!;
      revalidatePath(`/catalog/${prod.categorySlug}/${prod.slug}`);
    }
    revalidatePath(back);
    revalidatePath('/', 'layout');
  } catch {
    return NextResponse.redirect(new URL(`${back}?up=err`, request.url), { status: 303 });
  }

  return NextResponse.redirect(new URL(`${back}?up=ok`, request.url), { status: 303 });
}
