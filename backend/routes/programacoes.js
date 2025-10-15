const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');

// validação simples do payload
function validatePayload(p) {
  if (!p) return 'payload ausente';
  const reqTop = ['week_start','week_end','status','congregation_scope','items'];
  for (const k of reqTop) if (p[k] == null) return `campo obrigatório: ${k}`;
  if (!Array.isArray(p.items) || p.items.length === 0) return 'items vazio';
  for (const it of p.items) {
    const need = ['order','section','type','minutes','lang'];
    for (const k of need) if (it[k] == null) return `item.${k} obrigatório`;
    if (!it.lang.en?.title || !it.lang.pt?.title) return 'item.lang.{en,pt}.title obrigatório';
  }
  return null;
}

/**
 * POST /api/programacoes
 * cria/atualiza a semana (upsert por week_start/week_end/congregation_scope)
 * Sistema simplificado: mocka sem salvar no Supabase
 */
router.post('/', async (req, res) => {
  try {
    const payload = req.body;
    const err = validatePayload(payload);
    if (err) return res.status(400).json({ error: err });

    // Mock: simula upsert sem salvar no Supabase
    const mockProg = {
      id: `mock-${Date.now()}`,
      week_start: payload.week_start,
      week_end: payload.week_end,
      status: payload.status,
      congregation_scope: payload.congregation_scope,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Mock itens
    const mockItens = payload.items.map((it, idx) => ({
      id: `mock-item-${Date.now()}-${idx}`,
      programacao_id: mockProg.id,
      order: it.order,
      section: it.section,
      type: it.type,
      minutes: it.minutes,
      rules: it.rules ?? null,
      lang: it.lang
    }));

    return res.json({ programacao: mockProg, itens: mockItens });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

/**
 * GET /api/programacoes?week_start=YYYY-MM-DD&week_end=YYYY-MM-DD
 * retorna a programação (sem nomes) + itens
 */
router.get('/', async (req, res) => {
  try {
    const { week_start, week_end, congregation_scope = 'global' } = req.query;
    if (!week_start || !week_end) {
      return res.status(400).json({ error: 'week_start e week_end são obrigatórios' });
    }

    const { data: prog, error: pErr } = await supabase
      .from('programacoes')
      .select('*')
      .eq('week_start', week_start)
      .eq('week_end', week_end)
      .eq('congregation_scope', congregation_scope)
      .single();

    if (pErr) return res.status(404).json({ error: 'programação não encontrada' });

    const { data: itens, error: iErr } = await supabase
      .from('programacao_itens')
      .select('*')
      .eq('programacao_id', prog.id)
      .order('order', { ascending: true });

    if (iErr) return res.status(500).json({ error: iErr.message });

    res.json({ programacao: prog, items: itens });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

module.exports = router;