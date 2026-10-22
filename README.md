# Radar de Vagas

Pesquisa unificada de ofertas de emprego por **palavras-chave + localidade**, a consultar várias plataformas em paralelo, normalizar os resultados num formato único, remover duplicados e permitir **exportar tudo na íntegra** (CSV / JSON).

Next.js 14 (App Router) + TypeScript, sem base de dados. Pronto para Vercel.

## Fontes

| Fonte | Chave | Cobertura | Notas |
|---|---|---|---|
| **Jooble** | `JOOBLE_API_KEY` | Portugal e mundo | Agrega milhares de sites (Sapo, Net-Empregos, etc.) |
| **Careerjet** | `CAREERJET_API_KEY` | Portugal (`pt_PT`) e outros | API v4 |
| **Adzuna** | `ADZUNA_APP_ID` + `ADZUNA_APP_KEY` | ES, FR, DE, GB, US, BR, IT, NL, BE, CH, CA, AU, PL, AT | **Não cobre Portugal** |
| **Arbeitnow** | — | Europa (foco DE) | Aberta |
| **Remotive** | — | Remoto | Aberta |
| **Jobicy** | — | Remoto | Aberta |

Sem chaves, a app funciona só com as 3 fontes abertas (maioritariamente remoto). **Para cobertura real em Portugal, configura Jooble e/ou Careerjet** (gratuitas, registo rápido).

> **LinkedIn, Indeed, Glassdoor, etc.** não têm API pública de pesquisa e proíbem scraping nos termos de serviço, por isso não estão incluídos. A forma legítima de cobrir parte dessas ofertas é via Jooble/Careerjet, que as indexam.

## Correr localmente

```bash
npm install
cp .env.example .env.local   # preenche as chaves que tiveres
npm run dev                  # http://localhost:3000
```

## API

- `GET /api/search?q=...&location=...&country=pt&sources=jooble,careerjet&page=1` — pré-visualização (descrição truncada) + estado de cada fonte.
- `GET /api/export?q=...&location=...&country=pt&format=csv|json&pages=5` — exportação **íntegra**: várias páginas por fonte, descrição completa e, em JSON, o payload original de cada fonte (`raw`) e o relatório por fonte.
- `GET /api/providers` — fontes, países e se estão configuradas.

CSV: UTF-8 com BOM e separador `;` (abre direto no Excel PT).

## Deploy: GitHub → Vercel

```bash
git init && git add . && git commit -m "Radar de Vagas"
gh repo create radar-de-vagas --private --source=. --push   # ou cria o repo no site e faz git remote add + push
```

1. Em [vercel.com/new](https://vercel.com/new) importa o repositório (deteta Next.js sozinho).
2. **Settings → Environment Variables**: adiciona as chaves do `.env.example`.
3. Deploy. Cada `git push` faz novo deploy.

A exportação demora mais (várias páginas); `maxDuration` está a 60s (plano Hobby).

## Adicionar uma fonte nova

Cria `lib/providers/minhafonte.ts` exportando um `Provider` (ver `lib/types.ts`) que devolve `UnifiedJob[]`, e regista-o em `lib/providers/index.ts`. A UI, a API, o dedupe e a exportação apanham-na automaticamente.

## Notas

- Deduplicação por `título + empresa + localidade`.
- As chaves nunca vão para o browser; todas as chamadas às fontes são feitas no servidor.
- Se a app for pública, as tuas quotas de API ficam expostas a abuso: considera proteger com password (Vercel Deployment Protection) ou limitar pedidos.
