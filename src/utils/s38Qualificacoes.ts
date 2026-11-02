/**
 * Regras S-38 de qualificação por parte.
 * Partes exclusivas para irmãos: presidente, oração, Tesouros, Joias,
 * Leitura da Bíblia, Discurso e Nossa Vida Cristã.
 * Partes de ministério (iniciar, cultivar, fazer discípulos, explicar) valem para ambos.
 */
export const QUALIFICACOES = [
  { key: 'q_chairman', label: 'Presidente', somenteHomens: true, cargos: ['anciao', 'servo_ministerial'] },
  { key: 'q_pray', label: 'Oração', somenteHomens: true, cargos: ['anciao', 'servo_ministerial', 'publicador_batizado', 'pioneiro_regular'] },
  { key: 'q_treasures', label: 'Tesouros', somenteHomens: true, cargos: ['anciao', 'servo_ministerial'] },
  { key: 'q_gems', label: 'Joias espirituais', somenteHomens: true, cargos: ['anciao', 'servo_ministerial'] },
  { key: 'q_reading', label: 'Leitura da Bíblia', somenteHomens: true },
  { key: 'q_starting', label: 'Iniciando conversas', somenteHomens: false },
  { key: 'q_following', label: 'Cultivando o interesse', somenteHomens: false },
  { key: 'q_making', label: 'Fazendo discípulos', somenteHomens: false },
  { key: 'q_explaining', label: 'Explicando crenças', somenteHomens: false },
  { key: 'q_talk', label: 'Discurso', somenteHomens: true },
  { key: 'q_living', label: 'Nossa Vida Cristã', somenteHomens: true, cargos: ['anciao', 'servo_ministerial'] },
] as const;

export type QualKey = typeof QUALIFICACOES[number]['key'];
export const CARGOS_VALIDOS = ['anciao', 'servo_ministerial', 'pioneiro_regular', 'publicador_batizado', 'publicador_nao_batizado', 'estudante_novo'] as const;

/** Indica se a qualificação é permitida para o gênero/cargo informado. */
export function qualificacaoPermitida(key: QualKey, genero: string, cargo: string): boolean {
  const q = QUALIFICACOES.find((x) => x.key === key)!;
  if (q.somenteHomens && genero !== 'masculino') return false;
  if ('cargos' in q && q.cargos && !(q.cargos as readonly string[]).includes(cargo)) return false;
  return true;
}

/** Remove qualificações incompatíveis com gênero/cargo. */
export function sanearQualificacoes<T extends Record<string, any>>(e: T): T {
  const out: Record<string, any> = { ...e };
  for (const q of QUALIFICACOES) {
    if (out[q.key] && !qualificacaoPermitida(q.key, out.genero, out.cargo)) out[q.key] = false;
  }
  return out as T;
}

export function normalizarGenero(v: unknown): 'masculino' | 'feminino' {
  const s = String(v ?? '').trim().toLowerCase();
  return s.startsWith('f') ? 'feminino' : 'masculino';
}

export function normalizarCargo(v: unknown): typeof CARGOS_VALIDOS[number] {
  const s = String(v ?? '').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/\s+/g, '_');
  return (CARGOS_VALIDOS as readonly string[]).includes(s) ? (s as any) : 'estudante_novo';
}

const semAcento = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/** Descobre qual qualificação S-38 uma parte da apostila exige (null = sem regra específica). */
export function qualificacaoDaParte(titulo: string, secao = ''): QualKey | null {
  const t = semAcento(titulo); const s = semAcento(secao);
  if (t.includes('leitura da biblia')) return 'q_reading';
  if (t.includes('joias')) return 'q_gems';
  if (t.includes('iniciando')) return 'q_starting';
  if (t.includes('cultivando')) return 'q_following';
  if (t.includes('fazendo discipulos')) return 'q_making';
  if (t.includes('explicando')) return 'q_explaining';
  if (t.startsWith('discurso')) return 'q_talk';
  if (s.includes('tesouros')) return 'q_treasures';
  if (s.includes('vida crista')) return 'q_living';
  return null;
}

/** Estudante pode receber a parte: ativo, qualificação marcada e compatível com gênero/cargo. */
export function podeReceberParte(e: Record<string, any>, titulo: string, secao = ''): boolean {
  if (e.ativo === false) return false;
  const q = qualificacaoDaParte(titulo, secao);
  if (!q) return true;
  return !!e[q] && qualificacaoPermitida(q, e.genero, e.cargo);
}
