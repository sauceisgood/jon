export interface SearchParams {
  q: string;
  location: string;
  country: string; // código ISO minúsculo, ex.: "pt"
  page: number; // 1-based
  perPage: number;
  clientIp?: string;
  userAgent?: string;
}

/** Formato único para todas as fontes. */
export interface UnifiedJob {
  id: string; // `${source}:${idOriginal}`
  source: string; // id do conector
  sourceName: string;
  title: string;
  company: string;
  location: string;
  remote: boolean | null;
  contractType: string;
  salary: string;
  postedAt: string; // ISO 8601 ou ""
  url: string;
  description: string; // texto simples, íntegra
  raw?: unknown; // payload original da fonte (apenas na exportação JSON)
}

export interface ProviderResult {
  jobs: UnifiedJob[];
  total?: number;
  /** true quando a fonte não tem mais páginas para este pedido */
  exhausted?: boolean;
}

export interface Provider {
  id: string;
  name: string;
  homepage: string;
  note: string;
  requiredEnv: string[];
  remoteOnly?: boolean;
  supports?: (country: string) => boolean;
  search: (p: SearchParams) => Promise<ProviderResult>;
}

export type ProviderStatus = 'ok' | 'erro' | 'sem_chave' | 'pais_nao_suportado';

export interface ProviderReport {
  id: string;
  name: string;
  status: ProviderStatus;
  count: number;
  total?: number;
  ms: number;
  error?: string;
}
