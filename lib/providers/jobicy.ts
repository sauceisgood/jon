import { Provider } from '../types';
import { getCountry } from '../countries';
import { fetchJson, stripHtml, toIso } from '../util';

// Docs: https://jobicy.com/jobs-rss-feed  (aberta; só vagas remotas)
export const jobicy: Provider = {
  id: 'jobicy',
  name: 'Jobicy',
  homepage: 'https://jobicy.com/api/v2/remote-jobs',
  note: 'Aberta, sem chave. Só trabalho remoto; filtra por país.',
  requiredEnv: [],
  remoteOnly: true,
  async search(p) {
    if (p.page > 1) return { jobs: [], exhausted: true };
    const qs = new URLSearchParams({ count: '50' });
    const geo = getCountry(p.country)?.jobicy;
    if (geo) qs.set('geo', geo);
    if (p.q) qs.set('tag', p.q);
    const data = await fetchJson<any>(`https://jobicy.com/api/v2/remote-jobs?${qs}`);
    const list: any[] = data?.jobs ?? [];
    return {
      exhausted: true,
      total: list.length,
      jobs: list.map((j) => ({
        id: `jobicy:${j.id}`,
        source: 'jobicy',
        sourceName: 'Jobicy',
        title: stripHtml(j.jobTitle),
        company: j.companyName ?? '',
        location: Array.isArray(j.jobGeo) ? j.jobGeo.join(', ') : j.jobGeo ?? '',
        remote: true,
        contractType: Array.isArray(j.jobType) ? j.jobType.join(', ') : j.jobType ?? '',
        salary:
          j.annualSalaryMin || j.salaryMin
            ? `${j.annualSalaryMin ?? j.salaryMin}–${j.annualSalaryMax ?? j.salaryMax} ${j.salaryCurrency ?? ''}`.trim()
            : '',
        postedAt: toIso(j.pubDate),
        url: j.url,
        description: stripHtml(j.jobDescription || j.jobExcerpt),
        raw: j,
      })),
    };
  },
};
