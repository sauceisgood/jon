const ENTITIES: Record<string, string> = {
  '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#39;': "'", '&apos;': "'",
  '&nbsp;': ' ', '&euro;': '€', '&ndash;': '–', '&mdash;': '—', '&hellip;': '…',
};

export function stripHtml(html: unknown): string {
  if (typeof html !== 'string') return '';
  return html
    .replace(/<\s*(br|\/p|\/div|\/li|\/h[1-6])\s*\/?>/gi, '\n')
    .replace(/<\s*li[^>]*>/gi, '• ')
    .replace(/<[^>]+>/g, '')
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCodePoint(parseInt(n, 16)))
    .replace(/&[a-z]+;|&#39;/gi, (m) => ENTITIES[m.toLowerCase()] ?? m)
    .replace(/[ \t]+\n/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function norm(s: string): string {
  return (s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();
}

/** Todas as palavras-chave têm de aparecer no texto (AND). */
export function matchesKeywords(text: string, q: string): boolean {
  const words = norm(q).split(/\s+/).filter(Boolean);
  if (!words.length) return true;
  const t = norm(text);
  return words.every((w) => t.includes(w));
}

export function matchesLocation(text: string, location: string): boolean {
  const l = norm(location);
  if (!l) return true;
  return norm(text).includes(l);
}

export async function fetchJson<T = any>(
  url: string,
  init: RequestInit & { timeoutMs?: number } = {},
): Promise<T> {
  const { timeoutMs = 9000, ...rest } = init;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...rest, signal: ctrl.signal, cache: 'no-store' });
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      throw new Error(`HTTP ${res.status} ${res.statusText} ${body.slice(0, 160)}`.trim());
    }
    return (await res.json()) as T;
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new Error(`Timeout após ${timeoutMs}ms`);
    throw e;
  } finally {
    clearTimeout(timer);
  }
}

export function toIso(v: unknown): string {
  if (v == null || v === '') return '';
  const d = typeof v === 'number' ? new Date(v < 1e12 ? v * 1000 : v) : new Date(String(v));
  return isNaN(d.getTime()) ? '' : d.toISOString();
}

export function env(name: string): string {
  return (process.env[name] || '').trim();
}
