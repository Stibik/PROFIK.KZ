import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { UPLOADS_DIR, contentTypeFor, safeName } from '@/lib/admin/media';

/** Отдаёт загруженные медиа из DATA_DIR/uploads (Том 0: медиа отдельно от кода). */
export async function GET(_req: Request, { params }: { params: { file: string } }) {
  const name = safeName(params.file);
  const full = path.join(UPLOADS_DIR, name);
  try {
    const buf = fs.readFileSync(full);
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        'Content-Type': contentTypeFor(name),
        'Cache-Control': 'public, max-age=86400',
      },
    });
  } catch {
    return new NextResponse('Not found', { status: 404 });
  }
}
