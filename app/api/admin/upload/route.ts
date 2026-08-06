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
  const files = form.getAll('file').filter((f): f is File => f instanceof File && f.size > 0);

  if (!isCategory && (!sku || !productBySku(sku))) {
    return NextResponse.redirect(new URL('/admin/products', request.url), { status: 303 });
  }
  if (files.length === 0) {
    return NextResponse.redirect(new URL(`${back}?up=nofile`, request.url), { status: 303 });
  }

  try {
    fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    const urls: string[] = [];
    for (const file of files) {
      if (!isAllowedImage(file.name)) continue;
      const stamp = Date.now().toString(36) + Math.floor(performance.now()).toString(36);
      const key = isCategory ? `cat-${safeName(catSlug)}` : safeName(sku);
      const fname = `${key}-${stamp}-${safeName(file.name)}`;
      const buf = Buffer.from(await file.arrayBuffer());
      fs.writeFileSync(path.join(UPLOADS_DIR, fname), buf);
      urls.push(`/media/${fname}`);
    }
    if (urls.length === 0) {
      return NextResponse.redirect(new URL(`${back}?up=type`, request.url), { status: 303 });
    }

    if (isCategory) {
      writeData((d) => {
        d.categoryOverlays[catSlug] = { ...(d.categoryOverlays[catSlug] ?? {}), bannerImage: urls[0] };
      });
      logAction('Контент-менеджер', `Загружен баннер категории ${catSlug}`);
      revalidatePath(`/catalog/${catSlug}`);
    } else {
      writeData((d) => {
        const cur = d.productOverlays[sku] ?? {};
        d.productOverlays[sku] = { ...cur, media: [...(cur.media ?? []), ...urls] };
      });
      logAction('Контент-менеджер', `Загружено фото товара ${sku}: ${urls.length}`);
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
