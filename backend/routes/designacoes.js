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

async function validateRegras(item, principal, assistente) {
  const tipo = (item?.tipo || '').toLowerCase();
  const regras = item?.regras_papel || {};

  // sexo:M para bible_reading e talk
  if ((tipo === 'bible_reading' || tipo === 'talk') && principal) {
    ensure(isMasculino(principal), `Item ${item.titulo}: requer sexo M para principal`);
  }

  // cbs/opening/concluding/local_needs => anciãos/SM
  if (['cbs', 'opening', 'concluding', 'local_needs'].includes(tipo) && principal) {
    ensure(isElderOrSM(principal), `Item ${item.titulo}: requer ancião/SM para principal`);
  }

  // assistente permitido nos tipos de campo
  if (['starting', 'following', 'making', 'public_witnessing'].includes(tipo)) {
    if (regras?.assistente === true) {
      // opcional/obrigatório: por ora apenas permite; se quiser obrigatório, validar aqui
    }
  } else {
    // Em outros tipos, se fornecido assistente, aceitar sem regra extra (ou rejeitar se quiser)
  }
}

// GET designações por programacao + congregação
router.get('/', requireAuth, async (req, res) => {
  try {
    const { programacao_id, congregacao_id } = req.query;
    if (!programacao_id || !congregacao_id) return res.status(400).json({ error: 'programacao_id e congregacao_id são obrigatórios' });

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

module.exports = router;

