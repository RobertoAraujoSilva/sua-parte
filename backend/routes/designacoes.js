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

// Geração automática de designações seguindo regras S-38
router.post('/generate', requireAuth, async (req, res) => {
  try {
    const { programacao_id, congregacao_id } = req.body || {};
    ensure(programacao_id, 'programacao_id é obrigatório');
    ensure(congregacao_id, 'congregacao_id é obrigatório');

    // 1) Carregar itens da programação
    const { data: itens, error: iErr } = await supabase
      .from('programacao_itens')
      .select('*')
      .eq('programacao_id', programacao_id)
      .order('order', { ascending: true });
    if (iErr) throw iErr;
    ensure(Array.isArray(itens) && itens.length > 0, 'programação sem itens');

    // 2) Carregar estudantes ativos da congregação
    const { data: estudantes, error: eErr } = await supabase
      .from('estudantes')
      .select('*')
      .eq('congregacao_id', congregacao_id)
      .eq('ativo', true);
    if (eErr) throw eErr;
    ensure(Array.isArray(estudantes) && estudantes.length > 0, 'sem estudantes ativos');

    // 3) Buscar histórico recente (6 meses) para rotação justa
    const since = new Date(); since.setMonth(since.getMonth() - 6);
    const { data: desHist, error: dHistErr } = await supabase
      .from('designacoes')
      .select('id')
      .eq('congregacao_id', congregacao_id)
      .gte('created_at', since.toISOString());
    if (dHistErr) throw dHistErr;
    const histIds = (desHist || []).map(d => d.id);
    let recentCounts = {};
    if (histIds.length > 0) {
      const { data: itensHist, error: iHistErr } = await supabase
        .from('designacao_itens')
        .select('principal_estudante_id, assistente_estudante_id, designacao_id')
        .in('designacao_id', histIds);
      if (iHistErr) throw iHistErr;
      recentCounts = itensHist.reduce((acc, it) => {
        if (it.principal_estudante_id) acc[it.principal_estudante_id] = (acc[it.principal_estudante_id] || 0) + 1;
        if (it.assistente_estudante_id) acc[it.assistente_estudante_id] = (acc[it.assistente_estudante_id] || 0) + 1;
        return acc;
      }, {});
    }

    // 4) Garantir cabeçalho de designação
    let { data: des, error: dErr } = await supabase
      .from('designacoes')
      .select('*')
      .eq('programacao_id', programacao_id)
      .eq('congregacao_id', congregacao_id)
      .single();

    if (dErr || !des) {
      const { data: inserted, error: insErr } = await supabase
        .from('designacoes')
        .insert({ programacao_id, congregacao_id })
        .select()
        .single();
      if (insErr) throw insErr;
      des = inserted;
    }

    const designacao_id = des.id;
    const usedThisWeek = new Set();

    // Helpers de elegibilidade (S-38)
    function roleIsElderOrSM(s) {
      const cargo = (s?.cargo || '').toLowerCase();
      return cargo.includes('anci') || cargo.includes('servo');
    }
    function isMale(s) {
      const g = (s?.genero || '').toLowerCase();
      return g === 'm' || g === 'masculino' || g === 'male' || g === 'homem';
    }
    function hasFlag(s, flag) {
      return flag in (s || {}) ? !!s[flag] : true;
    }
    function needsAssistant(tipo) {
      return ['starting', 'following', 'making', 'making_disciples'].includes(tipo);
    }

    function isEligibleForItem(s, item) {
      const tipo = getItemType(item);
      const section = (item?.section || '').toUpperCase();
      const rules = item?.rules || {};
      if (tipo === 'song') return false;

      if (Array.isArray(rules.eligible_roles) && rules.eligible_roles.length > 0) {
        const roles = rules.eligible_roles.map(r => String(r).toLowerCase());
        if (roles.includes('elder') && roleIsElderOrSM(s)) { /* ok */ }
        else if (roles.includes('ministerial_servant') && roleIsElderOrSM(s)) { /* ok */ }
        else if (roles.includes('brother') && isMale(s)) { /* ok */ }
        else if (roles.includes('sister') && !isMale(s)) { /* ok */ }
        else return false;
      }

      if (tipo === 'bible_reading') return isMale(s) && hasFlag(s, 'reading');
      if (tipo === 'spiritual_gems') return roleIsElderOrSM(s) && hasFlag(s, 'gems');
      if (section === 'TREASURES' && tipo === 'talk') return roleIsElderOrSM(s) && hasFlag(s, 'tresures');
      if (['opening_comments', 'concluding_comments'].includes(tipo)) return roleIsElderOrSM(s) || hasFlag(s, 'chairman') || hasFlag(s, 'pray');
      if (tipo === 'local_needs') return roleIsElderOrSM(s);
      if (tipo === 'cbs') return roleIsElderOrSM(s);
      if (tipo === 'starting') return hasFlag(s, 'starting');
      if (tipo === 'following') return hasFlag(s, 'following');
      if (['making', 'making_disciples'].includes(tipo)) return hasFlag(s, 'making');
      if (tipo === 'talk') return isMale(s) && hasFlag(s, 'talk');
      return !!s?.ativo;
    }

    function pickLeastUsed(cands) {
      const avail = cands.filter(c => !usedThisWeek.has(c.id));
      if (avail.length === 0) return null;
      return avail.sort((a, b) => (recentCounts[a.id] || 0) - (recentCounts[b.id] || 0))[0];
    }

    function findAssistant(candidate, pool) {
      // prefer same gender not used
      const same = pool.filter(s => s.genero && String(s.genero).toLowerCase() === String(candidate.genero).toLowerCase() && s.id !== candidate.id && !usedThisWeek.has(s.id));
      if (same.length > 0) return same[0];
      // fallback: familiar direto (pai/mae)
      const family = pool.filter(s => (
        (s.id_pai && s.id_pai === candidate.id) ||
        (s.id_mae && s.id_mae === candidate.id) ||
        (candidate.id_pai && candidate.id_pai === s.id) ||
        (candidate.id_mae && candidate.id_mae === s.id)
      ) && s.id !== candidate.id && !usedThisWeek.has(s.id));
      return family[0] || null;
    }

    const resultados = [];

    for (const item of itens) {
      const tipo = getItemType(item);
      if (tipo === 'song') {
        resultados.push({ programacao_item_id: item.id, skipped: true, reason: 'song' });
        continue;
      }

      const candidatosElegiveis = (estudantes || []).filter(s => isEligibleForItem(s, item));
      let candidato = pickLeastUsed(candidatosElegiveis);
      if (!candidato) {
        resultados.push({ programacao_item_id: item.id, principal_estudante_id: null, observacoes: `Nenhum elegível para ${getItemTitle(item)}` });
        continue;
      }

      let assistente = null;
      if (needsAssistant(tipo)) {
        assistente = findAssistant(candidato, estudantes);
      }

      // Validar regras mínimas
      await validateRegras(item, candidato, assistente);

      // Upsert do designacao_item
      const { data: existsItem } = await supabase
        .from('designacao_itens')
        .select('id')
        .eq('designacao_id', designacao_id)
        .eq('programacao_item_id', item.id)
        .single();

      const payload = {
        principal_estudante_id: candidato?.id || null,
        assistente_estudante_id: assistente?.id || null,
        observacoes: assistente === null && needsAssistant(tipo) ? 'PENDING_ASSISTANT' : 'OK'
      };

      if (existsItem) {
        const { error: updErr } = await supabase
          .from('designacao_itens')
          .update(payload)
          .eq('id', existsItem.id);
        if (updErr) throw updErr;
      } else {
        const { error: insErr } = await supabase
          .from('designacao_itens')
          .insert({
            designacao_id,
            programacao_item_id: item.id,
            ...payload
          });
        if (insErr) throw insErr;
      }

      usedThisWeek.add(candidato.id);
      if (assistente?.id) usedThisWeek.add(assistente.id);

      resultados.push({ programacao_item_id: item.id, principal_estudante_id: candidato.id, assistente_estudante_id: assistente?.id || null, status: payload.observacoes });
    }

    // Retornar itens atualizados
    const { data: itensOut, error: listErr } = await supabase
      .from('designacao_itens')
      .select('*')
      .eq('designacao_id', designacao_id)
      .order('id');
    if (listErr) throw listErr;

    res.json({ success: true, designacao: { id: designacao_id, programacao_id, congregacao_id }, itens: itensOut, detalhes: resultados });
  } catch (err) {
    console.error('❌ POST /api/designacoes/generate', err);
    res.status(err.status || 500).json({ error: err.message || 'Falha ao gerar designações' });
  }
});

module.exports = router;

