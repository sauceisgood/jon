import { PROVIDERS, isConfigured } from './providers';
import { norm } from './util';
import type { ProviderReport, SearchParams, UnifiedJob } from './types';

export interface AggregateResult {
  jobs: UnifiedJob[];
  providers: ProviderReport[];
}

const dedupeKey = (j: UnifiedJob) => `${norm(j.title)}|${norm(j.company)}|${norm(j.location)}`;

export async function aggregate(
  params: SearchParams,
  sourceIds: string[],
  pages = 1,
): Promise<AggregateResult> {
  const selected = PROVIDERS.filter((p) => sourceIds.includes(p.id));

  const results = await Promise.all(
    selected.map(async (p): Promise<{ report: ProviderReport; jobs: UnifiedJob[] }> => {
      const base = { id: p.id, name: p.name, count: 0, ms: 0 };
      if (!isConfigured(p)) {
        return { jobs: [], report: { ...base, status: 'sem_chave', error: `Falta: ${p.requiredEnv.join(', ')}` } };
      }
      if (p.supports && !p.supports(params.country)) {
        return { jobs: [], report: { ...base, status: 'pais_nao_suportado' } };
      }
      const t0 = Date.now();
      try {
        const jobs: UnifiedJob[] = [];
        let total: number | undefined;
        for (let i = 0; i < pages; i++) {
          const r = await p.search({ ...params, page: params.page + i });
          jobs.push(...r.jobs);
          total = r.total ?? total;
          if (r.exhausted || r.jobs.length === 0) break;
        }
        return { jobs, report: { ...base, status: 'ok', count: jobs.length, total, ms: Date.now() - t0 } };
      } catch (e: any) {
        return {
          jobs: [],
          report: { ...base, status: 'erro', ms: Date.now() - t0, error: String(e?.message || e).slice(0, 300) },
        };
      }
    }),
  );

  const seen = new Set<string>();
  const jobs: UnifiedJob[] = [];
  for (const j of results.flatMap((r) => r.jobs)) {
    if (!j.title || !j.url) continue;
    const k = dedupeKey(j);
    if (seen.has(k)) continue;
    seen.add(k);
    jobs.push(j);
  }
  jobs.sort((a, b) => (b.postedAt || '').localeCompare(a.postedAt || ''));

  return { jobs, providers: results.map((r) => r.report) };
}
