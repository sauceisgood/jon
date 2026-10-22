import type { NextRequest } from 'next/server';
import { PROVIDERS } from './providers';
import type { SearchParams } from './types';

const clamp = (n: number, min: number, max: number, d: number) =>
  Number.isFinite(n) ? Math.min(max, Math.max(min, Math.floor(n))) : d;

export function parseRequest(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const sources = (sp.get('sources') || '').split(',').map((s) => s.trim()).filter(Boolean);
  const params: SearchParams = {
    q: (sp.get('q') || '').trim().slice(0, 200),
    location: (sp.get('location') || '').trim().slice(0, 120),
    country: (sp.get('country') || 'pt').toLowerCase().slice(0, 2),
    page: clamp(Number(sp.get('page')), 1, 50, 1),
    perPage: clamp(Number(sp.get('perPage')), 5, 50, 20),
    clientIp: (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || undefined,
    userAgent: req.headers.get('user-agent') || undefined,
  };
  return {
    params,
    sources: sources.length ? sources : PROVIDERS.map((p) => p.id),
    pages: clamp(Number(sp.get('pages')), 1, 10, 1),
    format: (sp.get('format') || 'json').toLowerCase(),
  };
}
