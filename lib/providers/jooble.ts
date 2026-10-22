import { Provider } from '../types';
import { getCountry } from '../countries';
import { env, fetchJson, stripHtml, toIso } from '../util';

// Docs: https://jooble.org/api/about  (POST https://jooble.org/api/{key})
export const jooble: Provider = {
  id: 'jooble',
  name: 'Jooble',
  homepage: 'https://jooble.org/api/about',
  note: 'Agregador de milhares de sites de emprego (inclui Portugal).',
  requiredEnv: ['JOOBLE_API_KEY'],
  async search(p) {
    const key = env('JOOBLE_API_KEY');
    const where = p.location || getCountry(p.country)?.name || '';
    const data = await fetchJson<any>(`https://jooble.org/api/${key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords: p.q, location: where, page: String(p.page) }),
    });
    const list: any[] = data?.jobs ?? [];
    return {
      total: data?.totalCount,
      exhausted: list.length === 0,
      jobs: list.map((j) => ({
        id: `jooble:${j.id ?? j.link}`,
        source: 'jooble',
        sourceName: j.source ? `Jooble · ${j.source}` : 'Jooble',
        title: stripHtml(j.title),
        company: j.company ?? '',
        location: j.location ?? '',
        remote: null,
        contractType: j.type ?? '',
        salary: j.salary ?? '',
        postedAt: toIso(j.updated),
        url: j.link,
        description: stripHtml(j.snippet),
        raw: j,
      })),
    };
  },
};
