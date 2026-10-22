import { Provider } from '../types';
import { getCountry } from '../countries';
import { fetchJson, matchesLocation, norm, stripHtml, toIso } from '../util';

// Docs: https://github.com/remotive-com/remote-jobs-api  (aberta; só vagas remotas)
export const remotive: Provider = {
  id: 'remotive',
  name: 'Remotive',
  homepage: 'https://github.com/remotive-com/remote-jobs-api',
  note: 'Aberta, sem chave. Só trabalho remoto; filtra por localização elegível.',
  requiredEnv: [],
  remoteOnly: true,
  async search(p) {
    if (p.page > 1) return { jobs: [], exhausted: true };
    const data = await fetchJson<any>(
      `https://remotive.com/api/remote-jobs?search=${encodeURIComponent(p.q)}&limit=200`,
    );
    const country = getCountry(p.country)?.name ?? '';
    const open = /worldwide|anywhere|global|europe|emea|eu\b/i;
    const list: any[] = (data?.jobs ?? []).filter((j: any) => {
      const loc = j.candidate_required_location || '';
      if (!p.location && !country) return true;
      return (
        open.test(loc) ||
        matchesLocation(loc, p.location) ||
        (!!country && norm(loc).includes(norm(country)))
      );
    });
    return {
      exhausted: true,
      total: list.length,
      jobs: list.map((j) => ({
        id: `remotive:${j.id}`,
        source: 'remotive',
        sourceName: 'Remotive',
        title: j.title,
        company: j.company_name ?? '',
        location: j.candidate_required_location ?? '',
        remote: true,
        contractType: (j.job_type || '').replace(/_/g, ' '),
        salary: j.salary ?? '',
        postedAt: toIso(j.publication_date),
        url: j.url,
        description: stripHtml(j.description),
        raw: j,
      })),
    };
  },
};
