import { Provider, UnifiedJob } from '../types';
import { fetchJson, matchesKeywords, matchesLocation, stripHtml, toIso } from '../util';

// Docs: https://www.arbeitnow.com/api/job-board-api  (aberta, sem chave; sem filtros -> filtramos aqui)
export const arbeitnow: Provider = {
  id: 'arbeitnow',
  name: 'Arbeitnow',
  homepage: 'https://www.arbeitnow.com/blog/job-board-api',
  note: 'Aberta, sem chave. Foco em Alemanha/Europa e vagas com visto/relocalização.',
  requiredEnv: [],
  async search(p) {
    if (p.page > 1) return { jobs: [], exhausted: true };
    const pages = await Promise.all(
      [1, 2, 3].map((n) =>
        fetchJson<any>(`https://www.arbeitnow.com/api/job-board-api?page=${n}`).catch(() => null),
      ),
    );
    const all: any[] = pages.flatMap((d) => d?.data ?? []);
    const jobs: UnifiedJob[] = all
      .filter((j) => matchesKeywords(`${j.title} ${j.company_name} ${(j.tags || []).join(' ')} ${j.description}`, p.q))
      .filter((j) => matchesLocation(j.location || '', p.location || ''))
      .map((j) => ({
        id: `arbeitnow:${j.slug}`,
        source: 'arbeitnow',
        sourceName: 'Arbeitnow',
        title: j.title,
        company: j.company_name ?? '',
        location: j.location ?? '',
        remote: !!j.remote,
        contractType: (j.job_types || []).join(', '),
        salary: '',
        postedAt: toIso(j.created_at),
        url: j.url,
        description: stripHtml(j.description),
        raw: j,
      }));
    return { jobs, exhausted: true, total: jobs.length };
  },
};
