import { Provider } from '../types';
import { getCountry } from '../countries';
import { env, fetchJson, stripHtml, toIso } from '../util';

// Docs: https://www.careerjet.com/partners/api  (v4, Basic auth com a chave como utilizador)
export const careerjet: Provider = {
  id: 'careerjet',
  name: 'Careerjet',
  homepage: 'https://www.careerjet.com/partners/api',
  note: 'Motor de pesquisa de emprego com cobertura em Portugal (pt_PT).',
  requiredEnv: ['CAREERJET_API_KEY'],
  supports: (c) => !!getCountry(c)?.careerjet,
  async search(p) {
    const locale = getCountry(p.country)?.careerjet ?? 'pt_PT';
    const qs = new URLSearchParams({
      locale_code: locale,
      keywords: p.q,
      location: p.location,
      page: String(p.page),
      page_size: String(Math.min(p.perPage, 100)),
      sort: 'date',
      user_ip: p.clientIp || '127.0.0.1',
      user_agent: p.userAgent || 'Mozilla/5.0 (job-aggregator)',
    });
    const auth = Buffer.from(`${env('CAREERJET_API_KEY')}:`).toString('base64');
    const data = await fetchJson<any>(`https://search.api.careerjet.net/v4/query?${qs}`, {
      headers: { Authorization: `Basic ${auth}`, Referer: 'https://job-aggregator.vercel.app/' },
    });
    if (data?.type && data.type !== 'JOBS') {
      if (data.type === 'LOCATION') return { jobs: [], exhausted: true };
      throw new Error(data.error || `Resposta inesperada: ${data.type}`);
    }
    const list: any[] = data?.jobs ?? [];
    return {
      total: data?.hits,
      exhausted: p.page >= (data?.pages ?? 1) || list.length === 0,
      jobs: list.map((j) => ({
        id: `careerjet:${j.url}`,
        source: 'careerjet',
        sourceName: j.site ? `Careerjet · ${j.site}` : 'Careerjet',
        title: stripHtml(j.title),
        company: j.company ?? '',
        location: j.locations ?? '',
        remote: null,
        contractType: '',
        salary: j.salary ?? '',
        postedAt: toIso(j.date),
        url: j.url,
        description: stripHtml(j.description),
        raw: j,
      })),
    };
  },
};
