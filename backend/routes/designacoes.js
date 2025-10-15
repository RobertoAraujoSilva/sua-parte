const express = require('express');
const router = express.Router();
const { supabase } = require('../config/database');

const requireAuth = (req, res, next) => { next(); };

async function fetchItem(programacao_item_id) {
  const { data, error } = await supabase
    .from('programacao_itens')
    .select('*')
    .eq('id', programacao_item_id)
    .single();
  if (error) throw error;
  return data;
}

async function fetchEstudante(id) {
  if (!id) return null;
  const { data, error } = await supabase
    .from('estudantes')
    .select('id, genero, cargo, congregacao_id, ativo')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

function ensure(cond, message) {
  if (!cond) {
    const e = new Error(message);
    e.status = 400;
    throw e;
  }
}

function isMasculino(estudante) {
  const g = (estudante?.genero || '').toLowerCase();
  return g === 'm' || g === 'masculino' || g === 'male';
}

function isElderOrSM(estudante) {
  const cargo = (estudante?.cargo || '').toLowerCase();
  return cargo.includes('anci') || cargo.includes('servo') || cargo.includes('s.m');
}

function getItemType(item) {
  return (item?.type || item?.tipo || '').toLowerCase();
}
function getItemTitle(item) {
  return item?.lang?.pt?.title || item?.lang?.en?.title || item?.titulo || item?.title || `item ${item?.id || ''}`;
}

async function validateRegras(item, principal, assistente) {
  const tipo = getItemType(item);
  const regras = item?.rules || item?.regras_papel || {};
  const titulo = getItemTitle(item);

  // sexo:M para bible_reading e talk
  if ((tipo === 'bible_reading' || tipo === 'talk') && principal) {
    ensure(isMasculino(principal), `Item ${titulo}: requer sexo M para o principal`);
  }

  // cbs/opening_comments/concluding_comments/local_needs => anciãos/SM
  if (['cbs', 'opening_comments', 'concluding_comments', 'local_needs'].includes(tipo) && principal) {
    ensure(isElderOrSM(principal), `Item ${titulo}: requer ancião/SM para o principal`);
  }

  // assistente permitido nos tipos de campo
  if (['starting', 'following', 'making', 'making_disciples', 'public_witnessing'].includes(tipo)) {
    // opcional/obrigatório: por ora apenas permite; se quiser obrigatório, validar aqui
  }
}

// GET designações por programacao + congregação (ou mock para frontend simplificado)
router.get('/', requireAuth, async (req, res) => {
  try {
    const { programacao_id, congregacao_id } = req.query;
    // Modo mock: sempre retornar lista vazia para compatibilidade com frontend simplificado
    return res.json({ data: [] });

    const { data: des, error: dErr } = await supabase
      .from('designacoes')
      .select('*')
      .eq('programacao_id', programacao_id)
      .eq('congregacao_id', congregacao_id)
      .single();

    if (dErr) return res.json({ success: true, designacao: null, itens: [] });

    const { data: itens, error: iErr } = await supabase
      .from('designacao_itens')
      .select('*')
      .eq('designacao_id', des.id)
      .order('id');
    if (iErr) throw iErr;

    res.json({ success: true, designacao: des, itens });
  } catch (err) {
    console.error('❌ GET /api/designacoes', err);
    res.status(500).json({ error: 'Falha ao obter designações', details: err.message });
  }
});

// POST criar/atualizar designações para uma congregação
router.post('/', requireAuth, async (req, res) => {
  try {
    const { programacao_id, congregacao_id, itens } = req.body || {};
    ensure(programacao_id, 'programacao_id é obrigatório');
    ensure(congregacao_id, 'congregacao_id é obrigatório');

    // Upsert designacao (cabeçalho)
    let { data: existing } = await supabase
      .from('designacoes')
      .select('*')
      .eq('programacao_id', programacao_id)
      .eq('congregacao_id', congregacao_id)
      .single();

    if (!existing) {
      const { data: inserted, error: insErr } = await supabase
        .from('designacoes')
        .insert({ programacao_id, congregacao_id })
        .select()
        .single();
      if (insErr) throw insErr;
      existing = inserted;
    }

    const designacao_id = existing.id;

    // Validate and upsert each item
    for (const it of itens || []) {
      const item = await fetchItem(it.programacao_item_id);
      const principal = await fetchEstudante(it.principal_estudante_id);
      const assistente = await fetchEstudante(it.assistente_estudante_id);

      // Check same congregação and ativo
      if (principal) {
        ensure(principal.ativo !== false, 'Principal inativo');
        ensure(String(principal.congregacao_id || '') === String(congregacao_id), 'Principal de outra congregação');
      }
      if (assistente) {
        ensure(assistente.ativo !== false, 'Assistente inativo');
        ensure(String(assistente.congregacao_id || '') === String(congregacao_id), 'Assistente de outra congregação');
      }

      await validateRegras(item, principal, assistente);

      // Upsert by unique (designacao_id, programacao_item_id)
      const { data: existsItem } = await supabase
        .from('designacao_itens')
        .select('id')
        .eq('designacao_id', designacao_id)
        .eq('programacao_item_id', it.programacao_item_id)
        .single();

      if (existsItem) {
        const { error: updErr } = await supabase
          .from('designacao_itens')
          .update({
            principal_estudante_id: it.principal_estudante_id || null,
            assistente_estudante_id: it.assistente_estudante_id || null,
            observacoes: it.observacoes || null,
          })
          .eq('id', existsItem.id);
        if (updErr) throw updErr;
      } else {
        const { error: insErr } = await supabase
          .from('designacao_itens')
          .insert({
            designacao_id,
            programacao_item_id: it.programacao_item_id,
            principal_estudante_id: it.principal_estudante_id || null,
            assistente_estudante_id: it.assistente_estudante_id || null,
            observacoes: it.observacoes || null,
          });
        if (insErr) throw insErr;
      }
    }

    // Return full payload
    const { data: itensOut, error: listErr } = await supabase
      .from('designacao_itens')
      .select('*')
      .eq('designacao_id', designacao_id)
      .order('id');
    if (listErr) throw listErr;

    res.json({ success: true, designacao: { id: designacao_id, programacao_id, congregacao_id }, itens: itensOut });
  } catch (err) {
    console.error('❌ POST /api/designacoes', err);
    res.status(err.status || 500).json({ error: err.message || 'Falha ao salvar designações' });
  }
});

// Geração automática de designações seguindo regras S-38
// Sistema simplificado: mocka sem usar Supabase
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { programacao_id, congregacao_id } = req.body || {};
    ensure(programacao_id, 'programacao_id é obrigatório');
    ensure(congregacao_id, 'congregacao_id é obrigatório');

    // Mock: simula geração sem Supabase
    const mockItens = [
      { id: 'mock-di-1', programacao_item_id: 'mock-item-1', principal_estudante_id: 'mock-student-1', assistente_estudante_id: null, observacoes: 'OK' },
      { id: 'mock-di-2', programacao_item_id: 'mock-item-2', principal_estudante_id: 'mock-student-2', assistente_estudante_id: 'mock-student-3', observacoes: 'OK' },
      // Adicionar mais mocks conforme necessário
    ];

    res.json({ success: true, designacao: { id: `mock-des-${Date.now()}`, programacao_id, congregacao_id }, itens: mockItens, detalhes: [] });
  } catch (err) {
    console.error('❌ POST /api/designacoes/generate', err);
    res.status(err.status || 500).json({ error: err.message || 'Falha ao gerar designações' });
  }
});

// DELETE designação específica
router.delete('/:id', requireAuth, async (req, res) => {
  try {
    const { id } = req.params;
    ensure(id, 'ID da designação é obrigatório');

    // Primeiro, deletar os itens da designação
    const { error: deleteItensErr } = await supabase
      .from('designacao_itens')
      .delete()
      .eq('designacao_id', id);

    if (deleteItensErr) throw deleteItensErr;

    // Depois, deletar a designação
    const { error: deleteDesErr } = await supabase
      .from('designacoes')
      .delete()
      .eq('id', id);

    if (deleteDesErr) throw deleteDesErr;

    res.json({ success: true, message: 'Designação removida com sucesso' });
  } catch (err) {
    console.error('❌ DELETE /api/designacoes/:id', err);
    res.status(err.status || 500).json({ error: err.message || 'Falha ao remover designação' });
  }
});

// GET export designações
router.get('/export', requireAuth, async (req, res) => {
  try {
    // Buscar todas as designações com itens
    const { data: designacoes, error: desErr } = await supabase
      .from('designacoes')
      .select('*');

    if (desErr) throw desErr;

    const result = [];
    for (const des of designacoes || []) {
      const { data: itens, error: itensErr } = await supabase
        .from('designacao_itens')
        .select('*')
        .eq('designacao_id', des.id);

      if (itensErr) throw itensErr;

      result.push({
        designacao: des,
        itens: itens || []
      });
    }

    res.json({ success: true, data: result });
  } catch (err) {
    console.error('❌ GET /api/designacoes/export', err);
    res.status(500).json({ error: 'Falha ao exportar designações' });
  }
});

module.exports = router;

