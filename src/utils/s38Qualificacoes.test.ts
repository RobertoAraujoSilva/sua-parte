import { describe, it, expect } from 'vitest';
import { qualificacaoPermitida, sanearQualificacoes, normalizarCargo } from './s38Qualificacoes';

describe('S-38 qualificações', () => {
  it('irmã não pode fazer Leitura da Bíblia', () => {
    expect(qualificacaoPermitida('q_reading', 'feminino', 'publicador_batizado')).toBe(false);
  });
  it('irmã pode iniciar conversas', () => {
    expect(qualificacaoPermitida('q_starting', 'feminino', 'estudante_novo')).toBe(true);
  });
  it('presidente exige ancião ou servo', () => {
    expect(qualificacaoPermitida('q_chairman', 'masculino', 'publicador_batizado')).toBe(false);
    expect(qualificacaoPermitida('q_chairman', 'masculino', 'anciao')).toBe(true);
  });
  it('saneia qualificações inválidas', () => {
    const r = sanearQualificacoes({ genero: 'feminino', cargo: 'publicador_batizado', q_talk: true, q_making: true });
    expect(r.q_talk).toBe(false);
    expect(r.q_making).toBe(true);
  });
  it('normaliza cargo da planilha', () => {
    expect(normalizarCargo('Ancião')).toBe('anciao');
    expect(normalizarCargo('xyz')).toBe('estudante_novo');
  });
});
