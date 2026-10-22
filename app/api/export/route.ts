import { NextRequest, NextResponse } from 'next/server';
import { aggregate } from '@/lib/aggregate';
import { parseRequest } from '@/lib/params';
import { toCsv } from '@/lib/csv';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/** Exportação na íntegra: várias páginas por fonte, descrição completa e (JSON) payload original. */
export async function GET(req: NextRequest) {
  const { params, sources, pages, format } = parseRequest(req);
  if (!params.q && !params.location) {
    return NextResponse.json({ error: 'Indica palavras-chave e/ou localidade.' }, { status: 400 });
  }
  const { jobs, providers } = await aggregate({ ...params, perPage: 50 }, sources, pages);

  const slug = `vagas_${(params.q || 'todas').replace(/\W+/g, '-')}_${(params.location || params.country).replace(/\W+/g, '-')}_${new Date().toISOString().slice(0, 10)}`;

  if (format === 'csv') {
    return new NextResponse(toCsv(jobs), {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${slug}.csv"`,
      },
    });
  }
  const body = JSON.stringify(
    {
      exportedAt: new Date().toISOString(),
      query: { q: params.q, location: params.location, country: params.country, pagesPerSource: pages },
      total: jobs.length,
      providers,
      jobs,
    },
    null,
    2,
  );
  return new NextResponse(body, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Disposition': `attachment; filename="${slug}.json"`,
    },
  });
}
