import { startOfWeek } from 'date-fns';

const MESES: Record<string, number> = {
  janeiro: 0,
  fevereiro: 1,
  marco: 2,
  março: 2,
  abril: 3,
  maio: 4,
  junho: 5,
  julho: 6,
  agosto: 7,
  setembro: 8,
  outubro: 9,
  novembro: 10,
  dezembro: 11,
};

export const inicioDaSemanaAtual = (date = new Date()): Date =>
  startOfWeek(date, { weekStartsOn: 1 });

export function inicioDoPeriodo(periodo: string): Date | null {
  const texto = periodo.toLocaleLowerCase('pt-BR').replace(/\s+/g, ' ').trim();
  const inicio = texto.match(/^(\d{1,2})(?:\s*[-–—]\s*\d{1,2})?\s+de\s+([a-zç]+)(?:\s+de)?\s+(\d{4})$/i)
    ?? texto.match(/^(\d{1,2})\s+de\s+([a-zç]+)\s*[-–—].*?(\d{4})$/i);

  if (!inicio) return null;

  const dia = Number(inicio[1]);
  const mes = MESES[inicio[2]];
  const ano = Number(inicio[3]);
  if (mes === undefined || !Number.isInteger(dia) || !Number.isInteger(ano)) return null;

  const date = new Date(ano, mes, dia);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function periodoDaSemanaAtual<T extends { periodo: string }>(semanas: T[], hoje = new Date()): string | null {
  const inicioAtual = inicioDaSemanaAtual(hoje);
  const chaveAtual = `${inicioAtual.getFullYear()}-${inicioAtual.getMonth()}-${inicioAtual.getDate()}`;

  return semanas.find((semana) => {
    const inicio = inicioDoPeriodo(semana.periodo);
    return inicio && `${inicio.getFullYear()}-${inicio.getMonth()}-${inicio.getDate()}` === chaveAtual;
  })?.periodo ?? null;
}