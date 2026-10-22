import { NextRequest, NextResponse } from 'next/server';
import { aggregate } from '@/lib/aggregate';
import { parseRequest } from '@/lib/params';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const PREVIEW = 700;

export async function GET(req: NextRequest) {
  const { params, sources } = parseRequest(req);
  if (!params.q && !params.location) {
    return NextResponse.json({ error: 'Indica palavras-chave e/ou localidade.' }, { status: 400 });
  }
  const t0 = Date.now();
  const { jobs, providers } = await aggregate(params, sources, 1);
  return NextResponse.json({
    query: { q: params.q, location: params.location, country: params.country, page: params.page },
    total: jobs.length,
    ms: Date.now() - t0,
    providers,
    // Pré-visualização: a descrição completa só vem na exportação.
    jobs: jobs.map((j) => ({
      ...j,
      raw: undefined,
      description: j.description.length > PREVIEW ? j.description.slice(0, PREVIEW) + '…' : j.description,
    })),
  });
}
