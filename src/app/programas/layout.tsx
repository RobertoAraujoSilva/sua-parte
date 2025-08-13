import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gestão de Programas | Sistema Ministerial',
  description: 'Gerencie os programas da congregação com visualizações em lista, planilha e estatísticas',
};

export default function ProgramasLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}