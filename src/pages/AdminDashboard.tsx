import React, { useMemo, useState, useCallback } from 'react';

type LangKey = 'en' | 'pt';
type LangLabel = { title: string; notes?: string };
type Item = {
  order: number;
  section: 'OPENING' | 'TREASURES' | 'APPLY' | 'LIVING' | 'CLOSING';
  type:
    | 'song'
    | 'opening_comments'
    | 'talk'
    | 'spiritual_gems'
    | 'bible_reading'
    | 'starting'
    | 'following'
    | 'making_disciples'
    | 'local_needs'
    | 'cbs'
    | 'concluding_comments';
  minutes: number;
  rules?: {
    requires_male?: boolean;
    allows_assistant?: boolean;
    elders_only?: boolean;
    elders_or_ms_only?: boolean;
  };
  lang: { en: LangLabel; pt: LangLabel };
};

type Programacao = {
  week_start: string;
  week_end: string;
  status: 'rascunho' | 'publicada';
  congregation_scope: 'global' | 'scoped';
  items: Item[];
};

// ===== Seed de exemplo (03–09 Nov 2025) =====
const SEED_NOV_3_9: Programacao = {
  week_start: '2025-11-03',
  week_end: '2025-11-09',
  status: 'rascunho',
  congregation_scope: 'global',
  items: [
    { order: 1, section: 'OPENING', type: 'song', minutes: 5, lang: { en: { title: 'Song 132 and Prayer' }, pt: { title: 'Cântico 132 e oração' } } },
    { order: 2, section: 'OPENING', type: 'opening_comments', minutes: 1, lang: { en: { title: 'Opening Comments' }, pt: { title: 'Comentários iniciais' } } },
    { order: 3, section: 'TREASURES', type: 'talk', minutes: 10, rules: { requires_male: true }, lang: { en: { title: 'A Story of Unfailing Love', notes: '[Play VIDEO] Song of Solomon intro; Ca 1:9-11; 2:16-17' }, pt: { title: 'Uma história de amor verdadeiro', notes: '[Mostre o VÍDEO] Introdução a Cântico de Salomão; Cân. 1:9-11; 2:16-17' } } },
    { order: 4, section: 'TREASURES', type: 'spiritual_gems', minutes: 10, lang: { en: { title: 'Spiritual Gems', notes: 'Ca 2:7; questions for audience' }, pt: { title: 'Joias espirituais', notes: 'Cân. 2:7; perguntas para a audiência' } } },
    { order: 5, section: 'TREASURES', type: 'bible_reading', minutes: 4, rules: { requires_male: true }, lang: { en: { title: 'Bible Reading', notes: 'Ca 2:1-17 (th study 12)' }, pt: { title: 'Leitura da Bíblia', notes: 'Cân. 2:1-17 (th lição 12)' } } },
    { order: 6, section: 'APPLY', type: 'starting', minutes: 3, rules: { allows_assistant: true }, lang: { en: { title: 'Starting a Conversation', notes: 'HOUSE TO HOUSE; Love People (lmd) lesson 1 point 3' }, pt: { title: 'Iniciando conversas', notes: 'DE CASA EM CASA; Ame as Pessoas (lmd) lição 1 ponto 3' } } },
    { order: 7, section: 'APPLY', type: 'following', minutes: 4, rules: { allows_assistant: true }, lang: { en: { title: 'Following Up', notes: 'HOUSE TO HOUSE; lmd lesson 9 point 3' }, pt: { title: 'Cultivando o interesse', notes: 'DE CASA EM CASA; lmd lição 9 ponto 3' } } },
    { order: 8, section: 'APPLY', type: 'making_disciples', minutes: 5, rules: { allows_assistant: false }, lang: { en: { title: 'Making Disciples', notes: 'lff lesson 18 intro & points 1–3 (th study 8)' }, pt: { title: 'Fazendo discípulos', notes: 'lff lição 18 introdução e pontos 1–3 (th lição 8)' } } },
    { order: 9, section: 'LIVING', type: 'song', minutes: 5, lang: { en: { title: 'Song 46' }, pt: { title: 'Cântico 46' } } },
    { order: 10, section: 'LIVING', type: 'local_needs', minutes: 15, rules: { elders_only: true }, lang: { en: { title: 'The Generous Person Will Be Blessed', notes: '[Play VIDEO] Generosity Brings Joy — discussion by an elder' }, pt: { title: 'A pessoa generosa será abençoada', notes: '[Mostre o VÍDEO] A Generosidade nos Traz Alegria — consideração por um ancião' } } },
    { order: 11, section: 'LIVING', type: 'cbs', minutes: 30, rules: { elders_or_ms_only: true }, lang: { en: { title: 'Congregation Bible Study', notes: 'lfb lessons 32–33' }, pt: { title: 'Estudo bíblico de congregação', notes: 'lfb lições 32–33' } } },
    { order: 12, section: 'CLOSING', type: 'concluding_comments', minutes: 3, lang: { en: { title: 'Concluding Comments' }, pt: { title: 'Comentários finais' } } },
    { order: 13, section: 'CLOSING', type: 'song', minutes: 5, lang: { en: { title: 'Song 137 and Prayer' }, pt: { title: 'Cântico 137 e oração' } } }
  ]
};

const SECTION_LABEL: Record<Item['section'], { en: string; pt: string; color: string }> = {
  OPENING: { en: 'Opening', pt: 'Abertura', color: 'bg-sky-50' },
  TREASURES: { en: "Treasures From God's Word", pt: 'Tesouros da Palavra', color: 'bg-emerald-50' },
  APPLY: { en: 'Apply Yourself to the Field Ministry', pt: 'Faça seu melhor no ministério', color: 'bg-amber-50' },
  LIVING: { en: 'Living as Christians', pt: 'Nossa Vida Cristã', color: 'bg-violet-50' },
  CLOSING: { en: 'Closing', pt: 'Encerramento', color: 'bg-slate-50' }
};

function groupBySection(items: Item[]) {
  return items
    .slice()
    .sort((a, b) => a.order - b.order)
    .reduce<Record<Item['section'], Item[]>>((acc, it) => {
      (acc[it.section] ||= []).push(it);
      return acc;
    }, {} as Record<Item['section'], Item[]>);
}

export default function AdminDashboard() {
  const [langTab, setLangTab] = useState<LangKey>('pt');
  const [program, setProgram] = useState<Programacao | null>(null);

  const grouped = useMemo(() => (program ? groupBySection(program.items) : null), [program]);

  const importFromMWB = useCallback(() => {
    setProgram(SEED_NOV_3_9);
  }, []);

  const duplicateWeek = useCallback(() => {
    if (!program) return;
    setProgram({ ...program, status: 'rascunho' });
  }, [program]);

  const saveDraft = useCallback(async () => {
    if (!program) return;
    const body: Programacao = { ...program, status: 'rascunho' };
    const res = await fetch(`${import.meta.env.VITE_API_BASE || ''}/api/programacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const msg = await res.text();
      alert(`Erro ao salvar rascunho: ${res.status} ${msg}`);
      return;
    }
    alert('Rascunho salvo.');
  }, [program]);

  const publish = useCallback(async () => {
    if (!program) return;
    const body: Programacao = { ...program, status: 'publicada' };
    const res = await fetch(`${import.meta.env.VITE_API_BASE || ''}/api/programacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const msg = await res.text();
      alert(`Erro ao publicar: ${res.status} ${msg}`);
      return;
    }
    alert('Programa publicado para os Instrutores.');
  }, [program]);

  const printExport = useCallback(() => {
    window.print();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Programação da Semana (Admin)</h1>
          <p className="text-sm text-slate-600">
            Este é o <strong>modelo</strong> sem nomes. Após publicar, o Instrutor designa estudantes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setLangTab('pt')}
            className={`px-3 py-1 rounded border ${langTab === 'pt' ? 'bg-slate-900 text-white' : 'bg-white'}`}
          >
            Português (BR)
          </button>
          <button
            onClick={() => setLangTab('en')}
            className={`px-3 py-1 rounded border ${langTab === 'en' ? 'bg-slate-900 text-white' : 'bg-white'}`}
          >
            English
          </button>
        </div>
      </header>

      <div className="flex flex-wrap gap-2">
        <button onClick={importFromMWB} className="px-4 py-2 rounded bg-blue-600 text-white">Importar do MWB</button>
        <button onClick={duplicateWeek} className="px-4 py-2 rounded border">Duplicar semana</button>
        <button onClick={saveDraft} className="px-4 py-2 rounded border">Salvar rascunho</button>
        <button onClick={publish} className="px-4 py-2 rounded bg-emerald-600 text-white">Publicar</button>
        <button onClick={printExport} className="px-4 py-2 rounded border">Imprimir/Exportar</button>
      </div>

      <div className="flex items-center gap-3">
        <span className="text-sm text-slate-700">Semana:</span>
        <input
          type="date"
          value={program?.week_start || '2025-11-03'}
          onChange={(e) => {
            const start = e.target.value;
            const end = new Date(new Date(start).getTime() + 6 * 86400000).toISOString().slice(0, 10);
            setProgram((p) => ({ ...(p || SEED_NOV_3_9), week_start: start, week_end: end }));
          }}
          className="border rounded px-2 py-1"
        />
        <span className="text-sm text-slate-500">{program?.week_end || '2025-11-09'}</span>
        <span className="ml-4 text-xs rounded bg-slate-100 px-2 py-1">Status: {program?.status || ''}</span>
        <span className="text-xs rounded bg-slate-100 px-2 py-1">Escopo: {program?.congregation_scope || ''}</span>
      </div>

      {!program ? (
        <div className="p-6 rounded border text-slate-600">
          Nenhum programa carregado. Clique em <strong>Importar do MWB</strong> para preencher esta semana ou selecione uma data.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped || {}).map(([sectionKey, items]) => (
            <section key={sectionKey} className="rounded border overflow-hidden">
              <div className={`px-4 py-2 border-b ${SECTION_LABEL[sectionKey as Item['section']].color}`}>
                <h2 className="font-semibold">
                  {langTab === 'pt'
                    ? SECTION_LABEL[sectionKey as Item['section']].pt
                    : SECTION_LABEL[sectionKey as Item['section']].en}
                </h2>
              </div>

              <ul className="divide-y">
                {(items as Item[]).map((it) => {
                  const L = it.lang[langTab];
                  return (
                    <li key={`${it.section}-${it.order}`} className="p-4 grid md:grid-cols-12 gap-3 items-start">
                      <div className="md:col-span-1 text-slate-500">{it.order}</div>
                      <div className="md:col-span-7">
                        <div className="font-medium">{L.title}</div>
                        {L.notes && <div className="text-sm text-slate-600 mt-1">{L.notes}</div>}
                        <div className="flex flex-wrap gap-2 mt-2">
                          {it.rules?.requires_male && (
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-100">Requer masculino</span>
                          )}
                          {it.rules?.allows_assistant && (
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-100">Permite assistente</span>
                          )}
                          {it.rules?.elders_only && (
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-100">Somente ancião</span>
                          )}
                          {it.rules?.elders_or_ms_only && (
                            <span className="text-xs px-2 py-0.5 rounded bg-slate-100">Ancião ou SM</span>
                          )}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <span className="inline-block px-2 py-1 rounded bg-slate-100 text-sm">{it.minutes} min</span>
                      </div>
                      <div className="md:col-span-2 text-right">
                        <button className="text-sm px-2 py-1 rounded border mr-2">Editar</button>
                        <button className="text-sm px-2 py-1 rounded border">Duplicar</button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

// =====

