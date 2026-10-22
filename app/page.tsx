'use client';

import { useEffect, useMemo, useState } from 'react';

interface ProviderInfo { id: string; name: string; note: string; requiredEnv: string[]; remoteOnly: boolean; configured: boolean }
interface Country { code: string; name: string }
interface Job {
  id: string; source: string; sourceName: string; title: string; company: string; location: string;
  remote: boolean | null; contractType: string; salary: string; postedAt: string; url: string; description: string;
}
interface Report { id: string; name: string; status: string; count: number; total?: number; ms: number; error?: string }

const STATUS_LABEL: Record<string, string> = {
  ok: 'ok', erro: 'erro', sem_chave: 'sem chave API', pais_nao_suportado: 'país não suportado',
};

export default function Home() {
  const [providers, setProviders] = useState<ProviderInfo[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [q, setQ] = useState('');
  const [location, setLocation] = useState('');
  const [country, setCountry] = useState('pt');
  const [selected, setSelected] = useState<string[]>([]);
  const [pages, setPages] = useState(3);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [ms, setMs] = useState(0);
  const [filterSource, setFilterSource] = useState('');
  const [onlyRemote, setOnlyRemote] = useState(false);

  useEffect(() => {
    fetch('/api/providers').then((r) => r.json()).then((d) => {
      setProviders(d.providers);
      setCountries(d.countries);
      setSelected(d.providers.filter((p: ProviderInfo) => p.configured).map((p: ProviderInfo) => p.id));
    }).catch(() => setError('Não foi possível carregar as fontes.'));
  }, []);

  const qs = (extra: Record<string, string> = {}) =>
    new URLSearchParams({ q, location, country, sources: selected.join(','), ...extra }).toString();

  async function search(e?: React.FormEvent) {
    e?.preventDefault();
    if (!q.trim() && !location.trim()) return setError('Indica palavras-chave e/ou localidade.');
    setError(''); setLoading(true); setFilterSource('');
    try {
      const res = await fetch(`/api/search?${qs()}`);
      const d = await res.json();
      if (!res.ok) throw new Error(d.error || 'Erro na pesquisa');
      setJobs(d.jobs); setReports(d.providers); setMs(d.ms);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const shown = useMemo(
    () => (jobs ?? []).filter((j) => (!filterSource || j.source === filterSource) && (!onlyRemote || j.remote)),
    [jobs, filterSource, onlyRemote],
  );
  const canExport = !loading && selected.length > 0 && (q.trim() || location.trim());
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  return (
    <main className="wrap">
      <h1>Radar de Vagas</h1>
      <p className="sub">Uma pesquisa, várias plataformas. Resultados normalizados, sem duplicados, exportáveis na íntegra.</p>

      <form className="card search" onSubmit={search}>
        <label className="f">Palavras-chave
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ex.: gestor sinistros, react developer" />
        </label>
        <label className="f">Localidade
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="ex.: Lisboa, Porto, Braga" />
        </label>
        <label className="f">País
          <select value={country} onChange={(e) => setCountry(e.target.value)}>
            {countries.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
          </select>
        </label>
        <button className="primary" disabled={loading || selected.length === 0}>{loading ? 'A pesquisar…' : 'Pesquisar'}</button>
      </form>

      <div className="sources" role="group" aria-label="Fontes">
        {providers.map((p) => (
          <label key={p.id} className={`chip ${p.configured ? '' : 'off'}`} title={p.note}>
            <input type="checkbox" style={{ width: 'auto' }} checked={selected.includes(p.id)} disabled={!p.configured}
              onChange={() => toggle(p.id)} />
            {p.name}
            {p.remoteOnly && <small>remoto</small>}
            {!p.configured && <small>falta {p.requiredEnv[0]}</small>}
          </label>
        ))}
      </div>

      {error && <p className="err" role="alert">{error}</p>}

      {jobs && (
        <>
          <div className="bar">
            <strong>{shown.length} vagas <span style={{ color: 'var(--muted)', fontWeight: 400 }}>· {(ms / 1000).toFixed(1)}s</span></strong>
            <div className="grp">
              <select value={filterSource} onChange={(e) => setFilterSource(e.target.value)} aria-label="Filtrar por fonte">
                <option value="">Todas as fontes</option>
                {providers.filter((p) => jobs.some((j) => j.source === p.id)).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
              <label className="chip"><input type="checkbox" style={{ width: 'auto' }} checked={onlyRemote} onChange={(e) => setOnlyRemote(e.target.checked)} /> só remoto</label>
              <select value={pages} onChange={(e) => setPages(Number(e.target.value))} aria-label="Páginas por fonte na exportação">
                {[1, 2, 3, 5, 10].map((n) => <option key={n} value={n}>{n} pág./fonte</option>)}
              </select>
              <a href={canExport ? `/api/export?${qs({ format: 'csv', pages: String(pages) })}` : undefined}><button type="button" disabled={!canExport}>Exportar CSV</button></a>
              <a href={canExport ? `/api/export?${qs({ format: 'json', pages: String(pages) })}` : undefined}><button type="button" disabled={!canExport}>Exportar JSON (íntegra)</button></a>
            </div>
          </div>
          <div className="status">
            {reports.map((r) => (
              <span key={r.id} className={`pill ${r.status}`} title={r.error}>
                {r.name}: {r.status === 'ok' ? `${r.count} · ${r.ms}ms` : STATUS_LABEL[r.status]}
              </span>
            ))}
          </div>
        </>
      )}

      <section style={{ marginTop: 16 }}>
        {jobs && shown.length === 0 && <p className="empty">Sem resultados. Tenta outras palavras-chave ou ativa mais fontes.</p>}
        {!jobs && !loading && <p className="empty">Escolhe palavras-chave e localidade para começar.</p>}
        <ul className="jobs">
          {shown.map((j) => (
            <li className="job" key={j.id}>
              <h3><a href={j.url} target="_blank" rel="noopener noreferrer">{j.title}</a></h3>
              <div className="meta">
                {j.company && <span>{j.company}</span>}
                {j.location && <span>📍 {j.location}</span>}
                {j.remote && <span>🏠 remoto</span>}
                {j.contractType && <span>{j.contractType}</span>}
                {j.salary && <span>💶 {j.salary}</span>}
                {j.postedAt && <span>{new Date(j.postedAt).toLocaleDateString('pt-PT')}</span>}
                <span className="src">{j.sourceName}</span>
              </div>
              {j.description && <p className="desc">{j.description}</p>}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
