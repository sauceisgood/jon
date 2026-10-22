import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Radar de Vagas',
  description: 'Pesquisa unificada de ofertas de emprego por localidade e palavras-chave.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-PT">
      <body>{children}</body>
    </html>
  );
}
