import { NextResponse } from 'next/server';
import { allProducts } from '@/lib/catalog';
import { runSearch } from '@/lib/search';

/** Поиск по актуальному каталогу (сид + импорт), Том 2, режим 1. */
export async function GET(request: Request) {
  const q = new URL(request.url).searchParams.get('q') ?? '';
  const hits = runSearch(allProducts(), q);
  return NextResponse.json({ hits }, { headers: { 'Cache-Control': 'no-store' } });
}
