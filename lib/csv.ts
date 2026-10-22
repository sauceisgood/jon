import type { UnifiedJob } from './types';

const COLS: [string, (j: UnifiedJob) => string][] = [
  ['fonte', (j) => j.sourceName],
  ['titulo', (j) => j.title],
  ['empresa', (j) => j.company],
  ['localizacao', (j) => j.location],
  ['remoto', (j) => (j.remote == null ? '' : j.remote ? 'sim' : 'nao')],
  ['contrato', (j) => j.contractType],
  ['salario', (j) => j.salary],
  ['publicado_em', (j) => j.postedAt],
  ['url', (j) => j.url],
  ['descricao', (j) => j.description],
  ['id', (j) => j.id],
];

const esc = (v: string) => `"${(v ?? '').replace(/"/g, '""')}"`;

/** CSV com BOM UTF-8 e separador ";" para abrir bem no Excel PT. */
export function toCsv(jobs: UnifiedJob[]): string {
  const head = COLS.map(([h]) => h).join(';');
  const rows = jobs.map((j) => COLS.map(([, f]) => esc(f(j))).join(';'));
  return '﻿' + [head, ...rows].join('\r\n');
}
