import { Provider } from '../types';
import { getCountry } from '../countries';
import { env, fetchJson, stripHtml, toIso } from '../util';

// Docs: https://developer.adzuna.com/  (não cobre Portugal)
export const adzuna: Provider = {
  id: 'adzuna',
  name: 'Adzuna',
  homepage: 'https://developer.adzuna.com/',
  note: 'Cobre ES, FR, DE, GB, US, BR, IT, NL, BE, CH, CA, AU, PL, AT — não cobre Portugal.',
  requiredEnv: ['ADZUNA_APP_ID', 'ADZUNA_APP_KEY'],
  supports: (c) => !!getCountry(c)?.adzuna,
  async search(p) {
    const qs = new URLSearchParams({
      app_id: env('ADZUNA_APP_ID'),
      app_key: env('ADZUNA_APP_KEY'),
      results_per_page: String(Math.min(p.perPage, 50)),
      what: p.q,
      where: p.location,
      sort_by: 'date',
    });
    const data = await fetchJson<any>(
      `https://api.adzuna.com/v1/api/jobs/${p.country}/search/${p.page}?${qs}`,
    );
    const list: any[] = data?.results ?? [];
    const sal = (j: any) =>
      j.salary_min || j.salary_max
        ? `${Math.round(j.salary_min || 0)}–${Math.round(j.salary_max || 0)}${j.salary_is_predicted === '1' ? ' (estimado)' : ''}`
        : '';
    return {
      total: data?.count,
      exhausted: list.length < Math.min(p.perPage, 50),
      jobs: list.map((j) => ({
        id: `adzuna:${j.id}`,
        source: 'adzuna',
        sourceName: 'Adzuna',
        title: stripHtml(j.title),
        company: j.company?.display_name ?? '',
        location: j.location?.display_name ?? '',
        remote: null,
        contractType: [j.contract_type, j.contract_time].filter(Boolean).join(' / '),
        salary: sal(j),
        postedAt: toIso(j.created),
        url: j.redirect_url,
        description: stripHtml(j.description),
        raw: j,
      })),
    };
  },
};
