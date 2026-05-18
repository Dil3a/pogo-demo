import { NextResponse } from 'next/server';
import { readFileSync } from 'fs';
import { join } from 'path';

export const dynamic = 'force-dynamic';

/**
 * GET /portail
 * Serves the UEMF student portal HTML file.
 */
export async function GET() {
  const filePath = join(process.cwd(), 'public', 'portail.html');
  const html = readFileSync(filePath, 'utf-8');
  return new NextResponse(html, {
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}
