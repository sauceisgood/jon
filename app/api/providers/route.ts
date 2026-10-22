import { NextResponse } from 'next/server';
import { PROVIDERS, isConfigured } from '@/lib/providers';
import { COUNTRIES } from '@/lib/countries';

export const dynamic = 'force-dynamic';

export function GET() {
  return NextResponse.json({
    countries: COUNTRIES.map(({ code, name }) => ({ code, name })),
    providers: PROVIDERS.map((p) => ({
      id: p.id,
      name: p.name,
      homepage: p.homepage,
      note: p.note,
      requiredEnv: p.requiredEnv,
      remoteOnly: !!p.remoteOnly,
      configured: isConfigured(p),
    })),
  });
}
