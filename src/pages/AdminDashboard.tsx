import React, { useMemo, useState } from 'react';

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
    }, {} as any);
}

export default function AdminDashboard() {
  const [langTab, setLangTab] = useState<LangKey>('pt');
  const [program, setProgram] = useState<Programacao | null>(null);

  const grouped = useMemo(() => (program ? groupBySection(program.items) : null), [program]);

  function importFromMWB() {
    setProgram(SEED_NOV_3_9);
  }

  function duplicateWeek() {
    if (!program) return;
    setProgram({ ...program, status: 'rascunho' });
  }

  async function saveDraft() {
    if (!program) return;
    const body: Programacao = { ...program, status: 'rascunho' };
    const res = await fetch(`${import.meta.env.VITE_API_BASE || ''}/api/programacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const msg = await res.text();
      alert(`Erro ao salvar rascunho: ${res.status} ${msg}`);
      return;
    }
    alert('Rascunho salvo.');
  }

  async function publish() {
    if (!program) return;
    const body: Programacao = { ...program, status: 'publicada' };
    const res = await fetch(`${import.meta.env.VITE_API_BASE || ''}/api/programacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const msg = await res.text();
      alert(`Erro ao publicar: ${res.status} ${msg}`);
      return;
    }
    alert('Programa publicado para os Instrutores.');
  }

  function printExport() {
    window.print();
  }

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
                  {langTab === 'pt' ? SECTION_LABEL[sectionKey as Item['section']].pt : SECTION_LABEL[sectionKey as Item['section']].en}
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

/*
  const handleAddCongregation = useCallback(async () => {
    console.log('➕ Adicionando nova congregação...');
    const congregationName = prompt('Digite o nome da nova congregação:');
    if (!congregationName) return;
    
    try {
      // Simulação - em produção seria inserção no Supabase
      console.log('✅ Congregação adicionada:', congregationName);
      alert(`✅ Congregação "${congregationName}" adicionada com sucesso!\n\nEla agora receberá automaticamente a programação oficial.`);
    } catch (error) {
      console.error('❌ Erro ao adicionar congregação:', error);
      alert('Erro ao adicionar congregação: ' + error.message);
    }
  }, []);

  // JW.org & S-38
  const handleMWBAvailable = useCallback(async () => {
    console.log('📚 Disponibilizando MWB atual...');
    try {
      await jworg.fetchCurrentWeek();
      console.log('✅ MWB atualizada');
      alert('✅ Apostila MWB atual disponibilizada para todas as congregações!');
    } catch (error) {
      console.error('❌ Erro ao disponibilizar MWB:', error);
      alert('Erro ao disponibilizar MWB: ' + error.message);
    }
  }, [jworg]);

  const handleConfigureJWorgURLs = useCallback(() => {
    console.log('⚙️ Configurando URLs JW.org...');
    const ptUrl = prompt('URL JW.org PT:', 'https://www.jw.org/pt/biblioteca/jw-apostila-do-mes/');
    const enUrl = prompt('URL JW.org EN:', 'https://www.jw.org/en/library/jw-meeting-workbook/');
    
    if (ptUrl && enUrl) {
      console.log('✅ URLs configuradas:', { ptUrl, enUrl });
      alert('✅ URLs JW.org configuradas com sucesso!');
    }
  }, []);

  const handleSyncCongregations = useCallback(async () => {
    console.log('🔄 Sincronizando com congregações...');
    try {
      // Simulação de sincronização
      const congregationsCount = staticStats.total_congregations;
      console.log(`✅ Sincronizando com ${congregationsCount} congregações`);
      alert(`🔄 Sincronização iniciada!\n\nProgramação oficial sendo enviada para ${congregationsCount} congregações...\n\nTempo estimado: ${Math.ceil(congregationsCount / 100)} minutos`);
    } catch (error) {
      console.error('❌ Erro na sincronização:', error);
      alert('Erro na sincronização: ' + error.message);
    }
  }, [staticStats]);

  // Programação Oficial
  const handleViewFullProgram = useCallback(() => {
    console.log('📅 Visualizando programação completa (3 meses)...');
    alert(`📅 Programação Completa dos Próximos 3 Meses\n\n` +
          `• Semanas carregadas: 12\n` +
          `• Idiomas: PT e EN\n` +
          `• Última atualização: Hoje\n\n` +
          `Esta visualização mostrará todas as apostilas MWB dos próximos 3 meses.`);
  }, []);

  const handleUpdateProgramPT = useCallback(async () => {
    console.log('🇧🇷 Atualizando programação PT...');
    try {
      jworg.setLanguage('pt');
      await jworg.fetchNextWeeks();
      console.log('✅ Programação PT atualizada');
      alert('✅ Programação em Português atualizada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao atualizar programação PT:', error);
      alert('Erro ao atualizar programação PT: ' + error.message);
    }
  }, [jworg]);

  const handleUpdateProgramEN = useCallback(async () => {
    console.log('🇺🇸 Atualizando programação EN...');
    try {
      jworg.setLanguage('en');
      await jworg.fetchNextWeeks();
      console.log('✅ Programação EN atualizada');
      alert('✅ Programação em Inglês atualizada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao atualizar programação EN:', error);
      alert('Erro ao atualizar programação EN: ' + error.message);
    }
  }, [jworg]);

  const handleCheckNewWeeks = useCallback(async () => {
    console.log('🔍 Verificando novas semanas...');
    try {
      await jworg.fetchNextWeeks();
      const newWeeks = jworg.nextWeeks.length;
      console.log(`✅ Verificação concluída: ${newWeeks} semanas`);
      alert(`🔍 Verificação concluída!\n\nEncontradas ${newWeeks} semanas de programação.\n\nTodas estão sincronizadas com JW.org.`);
    } catch (error) {
      console.error('❌ Erro ao verificar semanas:', error);
      alert('Erro ao verificar novas semanas: ' + error.message);
    }
  }, [jworg]);

  const handleUpdateS38Structure = useCallback(() => {
    console.log('🏗️ Atualizando estrutura S-38 global...');
    alert(`🏗️ Estrutura S-38 Global\n\n` +
          `✅ Partes da reunião atualizadas:\n` +
          `• Chairman\n• Treasures\n• Gems\n• Reading\n` +
          `• Starting\n• Following\n• Making\n• Explaining\n` +
          `• Talk\n\n` +
          `Esta estrutura será aplicada mundialmente.`);
  }, []);

  // JW.org Integration
  const handleReloadCurrentWeek = useCallback(async () => {
    console.log('🔄 Recarregando semana atual...');
    try {
      await jworg.fetchCurrentWeek();
      console.log('✅ Semana atual recarregada');
      alert('✅ Semana atual recarregada com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao recarregar semana:', error);
      alert('Erro ao recarregar semana: ' + error.message);
    }
  }, [jworg]);

  const handleReloadNextWeeks = useCallback(async () => {
    console.log('📅 Recarregando próximas semanas...');
    try {
      await jworg.fetchNextWeeks();
      console.log('✅ Próximas semanas recarregadas');
      alert('✅ Próximas semanas recarregadas com sucesso!');
    } catch (error) {
      console.error('❌ Erro ao recarregar próximas semanas:', error);
      alert('Erro ao recarregar próximas semanas: ' + error.message);
    }
  }, [jworg]);

  const handleTestDownloadPT = useCallback(async () => {
    console.log('🧪 Testando download PT...');
    try {
      jworg.setLanguage('pt');
      await jworg.downloadWorkbook('pt', '07', '2025');
      console.log('✅ Download PT testado');
      alert('✅ Download PT testado com sucesso!');
    } catch (error) {
      console.error('❌ Erro no teste de download PT:', error);
      alert('Erro no teste de download PT: ' + error.message);
    }
  }, [jworg]);

  // Monitoramento
  const handleViewAllLogs = useCallback(async () => {
    console.log('📋 Visualizando todos os logs...');
    try {
      // Simulação de logs
      const logs = [
        { timestamp: new Date().toLocaleString(), event: 'Sistema iniciado', level: 'info' },
        { timestamp: new Date(Date.now() - 3600000).toLocaleString(), event: 'Backup automático executado', level: 'info' },
        { timestamp: new Date(Date.now() - 86400000).toLocaleString(), event: 'Novo usuário registrado', level: 'info' },
        { timestamp: new Date(Date.now() - 172800000).toLocaleString(), event: 'Manutenção programada', level: 'warning' }
      ];
      
      const logText = logs.map(log => `${log.timestamp} [${log.level.toUpperCase()}] ${log.event}`).join('\n');
      alert(`📋 Logs do Sistema\n\n${logText}`);
    } catch (error) {
      console.error('❌ Erro ao carregar logs:', error);
      alert('Erro ao carregar logs: ' + error.message);
    }
  }, []);

  const handleTestJWorgIntegration = useCallback(async () => {
    console.log('🧪 Testando integração JW.org...');
    try {
      await jworg.fetchCurrentWeek();
      console.log('✅ Integração JW.org testada com sucesso');
      alert('✅ Integração JW.org funcionando perfeitamente!');
    } catch (error) {
      console.error('❌ Erro na integração JW.org:', error);
      alert('❌ Erro na integração JW.org: ' + error.message);
    }
  }, [jworg]);

  const handleChangeLanguage = useCallback((newLang: 'pt' | 'en') => {
    jworg.setLanguage(newLang);
    console.log(`🌐 Idioma alterado para: ${newLang}`);
    alert(`🌐 Idioma alterado para: ${newLang === 'pt' ? 'Português' : 'English'}`);
  }, [jworg]);

  // Alterna o idioma atual entre PT/EN
  const toggleLanguage = useCallback(() => {
    const current = (jworg as any)?.currentLanguage ?? 'pt';
    const next = current === 'pt' ? 'en' : 'pt';
    jworg.setLanguage(next);
    console.log(`🌐 Idioma alternado: ${current} -> ${next}`);
    alert(`🌐 Idioma alternado para: ${next === 'pt' ? 'Português' : 'English'}`);
  }, [jworg]);

  // Atualiza materiais JW.org (semana atual + próximas semanas)
  const updateMaterials = useCallback(async () => {
    try {
      await jworg.fetchCurrentWeek();
      await jworg.fetchNextWeeks();
      console.log('✅ Materiais JW.org atualizados');
      alert('✅ Materiais JW.org atualizados com sucesso!');
    } catch (error: any) {
      console.error('❌ Erro ao atualizar materiais:', error);
      alert('❌ Erro ao atualizar materiais: ' + (error?.message || error));
    }
  }, [jworg]);

  // NOW CHECK CONDITIONS AND RENDER APPROPRIATELY
  // Se não for admin, mostrar mensagem de acesso negado
  if (user && !isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Acesso Negado</CardTitle>
            <CardDescription>
              Você não tem permissão para acessar o painel administrativo.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Seu perfil atual: <strong>{profile?.role}</strong>
            </p>
            <Button onClick={() => window.history.back()}>
              Voltar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Se não houver usuário, mostrar loading
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Carregando...</CardTitle>
            <CardDescription>
              Verificando autenticação...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center">
              <RefreshCw className="h-6 w-6 animate-spin" />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Auth Error Handler */}
      <AuthErrorHandler />
      
      {/* Header */}
      <div className="border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">📊 Dashboard do Administrador Geral</h1>
                <p className="text-muted-foreground">
                  Programação oficial das reuniões ministeriais - Padronização mundial para todas as congregações
              </p>
            </div>
              <div className="flex items-center space-x-2">
              {/* Force Profile Load Button */}
              {import.meta.env.DEV && (
                <Button 
                  variant="outline" 
                  size="sm"
                    onClick={testSupabaseConnection}
                  >
                    🔧 Test Supabase
                </Button>
              )}
              
              <Button onClick={checkForUpdates} disabled={loading}>
                <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                  Atualizar
              </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Info Panel */}
      {import.meta.env.DEV && (
        <div className="container mx-auto px-4 py-2">
          <Card className="bg-yellow-50 border-yellow-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-yellow-800">🐛 Debug Info (Development Only)</CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="text-xs text-yellow-700 overflow-auto max-h-40">
                {debugInfo}
              </pre>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Visão Geral</TabsTrigger>
            <TabsTrigger value="users">Usuários</TabsTrigger>
            <TabsTrigger value="congregations">Congregações</TabsTrigger>
            <TabsTrigger value="system">Sistema</TabsTrigger>
          </TabsList>

          {/* Visão Geral */}
          <TabsContent value="overview" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-center text-muted-foreground">
                🎯 Sistema Ministerial Global - Padronização Mundial
              </h3>
              <div className="text-center text-sm text-muted-foreground mt-2 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <strong>📊 Admin Geral:</strong> Disponibiliza programação oficial semanal (SEM nomes de estudantes) <br/>
                <strong>🎓 Instrutores:</strong> Recebem programação automaticamente + fazem designações locais reais
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Congregações Conectadas</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{staticStats.total_congregations}</div>
                  <p className="text-xs text-muted-foreground">
                    Recebendo programação oficial
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Semanas Programadas</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">12</div>
                  <p className="text-xs text-muted-foreground">
                    Próximas 3 meses
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Idiomas Disponíveis</CardTitle>
                  <Globe className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">2</div>
                  <p className="text-xs text-muted-foreground">
                    Português e Inglês
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Última Sincronização</CardTitle>
                  <RefreshCw className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">✅</div>
                  <p className="text-xs text-muted-foreground">
                    Hoje, {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Ações Rápidas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Status do Sistema */}
              <Card>
                <CardHeader>
                  <CardTitle>Status do Sistema</CardTitle>
                  <CardDescription>
                    Informações sobre a última verificação e status geral
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Última Verificação:</span>
                    <span className="text-sm text-muted-foreground">
                      {lastCheck ? new Date(lastCheck).toLocaleString('pt-BR') : 'Nunca'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Status:</span>
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Operacional
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Supabase:</span>
                    <Badge variant="outline" className="text-green-600">
                      <Database className="h-3 w-3 mr-1" />
                      Conectado
                    </Badge>
                  </div>
                </CardContent>
              </Card>

              {/* JW.org Downloads */}
              <Card className="bg-green-50 border-green-200">
                <CardHeader>
                  <CardTitle className="text-green-800">📚 JW.org Downloads</CardTitle>
                  <CardDescription className="text-green-700">
                    Gerenciar materiais oficiais
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Apostila MWB Atual:</span>
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Disponível
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Última verificação:</span>
                    <span className="text-sm text-green-700">Hoje, 10:30</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="border-green-300 text-green-700" onClick={handleMWBAvailable}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Disponibilizar MWB Atual
                    </Button>
                    <Button size="sm" variant="outline" className="border-green-300 text-green-700" onClick={handleConfigureJWorgURLs}>
                      <Settings className="h-3 w-3 mr-1" />
                      Configurar URLs JW.org
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Sistema S-38 - Designações */}
              <Card className="bg-purple-50 border-purple-200">
                <CardHeader>
                  <CardTitle className="text-purple-800">⚙️ Sistema S-38</CardTitle>
                  <CardDescription className="text-purple-700">
                    Estrutura das reuniões ministeriais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-purple-700 space-y-2">
                    <p>📚 <strong>Função do Admin:</strong> Disponibilizar apostilas MWB</p>
                    <p>👥 <strong>Para Instrutores:</strong> Designar estudantes para partes</p>
                    <p>🎯 <strong>Partes da Reunião:</strong></p>
                    <div className="grid grid-cols-2 gap-1 text-xs ml-2">
                      <div>• Chairman</div>
                      <div>• Treasures</div>
                      <div>• Gems</div>
                      <div>• Reading</div>
                      <div>• Starting</div>
                      <div>• Following</div>
                      <div>• Making</div>
                      <div>• Explaining</div>
                      <div>• Talk</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Debug / Integração */}
              <Card className="bg-slate-50 border-slate-200">
                <CardHeader>
                  <CardTitle className="text-slate-800">🧪 Debug / Integração</CardTitle>
                  <CardDescription className="text-slate-700">
                    Ferramentas rápidas para validar integrações e idioma
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Idioma Atual:</span>
                    <Badge variant="outline" className="text-slate-700">
                      {(jworg as any)?.currentLanguage === 'en' ? '🇺🇸 English' : '🇧🇷 Português'}
                    </Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={toggleLanguage}>
                      Alternar Idioma
                    </Button>
                    <Button size="sm" variant="outline" onClick={updateMaterials}>
                      Atualizar Materiais
                    </Button>
                    <Button size="sm" variant="outline" onClick={handleTestJWorgIntegration}>
                      Testar Integração JW.org
                    </Button>
                    <Button size="sm" variant="outline" onClick={checkForUpdates} disabled={loading}>
                      Atualizar Contagens
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Usuários */}
          <TabsContent value="users" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-center text-muted-foreground">
                👥 Gestão de Usuários para Acesso às Apostilas MWB
              </h3>
              <p className="text-center text-sm text-muted-foreground mt-2">
                🎯 Função Principal: Admin gerencia usuários → Instrutores acessam apostilas
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Estatísticas de Usuários */}
            <Card>
              <CardHeader>
                  <CardTitle>Estatísticas</CardTitle>
                  <CardDescription>Resumo dos usuários</CardDescription>
              </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total de Usuários:</span>
                      <Badge variant="outline">{staticStats.total_users}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Admins:</span>
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        {isAdmin ? 1 : 0}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Instrutores:</span>
                      <Badge variant="outline" className="bg-blue-50 text-blue-700">
                        {staticStats.total_users - (isAdmin ? 1 : 0)}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Usuários Registrados */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Usuários Registrados</CardTitle>
                  <CardDescription>Últimos usuários cadastrados no sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{profile?.nome_completo || 'Roberto Araujo da Silva'}</p>
                          <p className="text-sm text-muted-foreground">Administrator</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-red-50 text-red-700">
                        Admin
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Ações Administrativas */}
            <Card>
              <CardHeader>
                <CardTitle>Ações Administrativas</CardTitle>
                <CardDescription>
                  Gerenciar usuários e permissões
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button className="w-full justify-start" variant="outline" onClick={handleListUsers}>
                    <Users className="h-4 w-4 mr-2" />
                    Listar Todos os Usuários
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={handleManagePermissions}>
                    <Settings className="h-4 w-4 mr-2" />
                    Gerenciar Permissões
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={handleActivityReport}>
                    <Activity className="h-4 w-4 mr-2" />
                    Relatório de Atividades
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={handleBackupData}>
                    <Database className="h-4 w-4 mr-2" />
                    Backup de Dados
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Congregações */}
          <TabsContent value="congregations" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-center text-muted-foreground">
                🏢 Gestão de Congregações para Acesso às Apostilas MWB
              </h3>
              <p className="text-center text-sm text-muted-foreground mt-2">
                🎯 Função Principal: Admin gerencia congregações → Instrutores acessam apostilas
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Estatísticas de Congregações */}
            <Card>
              <CardHeader>
                  <CardTitle>Estatísticas</CardTitle>
                  <CardDescription>Resumo das congregações</CardDescription>
              </CardHeader>
              <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total de Congregações:</span>
                      <Badge variant="outline">{staticStats.total_congregations}</Badge>
                  </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Congregações Ativas:</span>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        {staticStats.active_congregations}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Total de Estudantes:</span>
                      <Badge variant="outline">{staticStats.total_estudantes}</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Lista de Congregações */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Congregações Registradas</CardTitle>
                  <CardDescription>Lista das congregações no sistema</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Package className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">Sistema Ministerial Global</p>
                          <p className="text-sm text-muted-foreground">Congregação Principal</p>
                          </div>
                        </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Ativa
                        </Badge>
                      </div>
                  </div>
                  
                  <div className="mt-4">
                    <Button variant="outline" className="w-full" onClick={() => handleManageCongregation('Sistema Ministerial Global')}>
                      <Users className="h-4 w-4 mr-2" />
                      Gerenciar
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    <Button variant="outline" className="w-full" onClick={handleAddCongregation}>
                      <Users className="h-4 w-4 mr-2" />
                      Adicionar Nova Congregação
                    </Button>
                  </div>
                  
                  <div className="mt-4">
                    <Button variant="outline" className="w-full">
                      <Users className="h-4 w-4 mr-2" />
                      Expandir
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Sistema */}
          <TabsContent value="system" className="space-y-6">
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-center text-muted-foreground">
                ⚙️ Monitoramento e Configurações do Sistema
              </h3>
              <p className="text-center text-sm text-muted-foreground mt-2">
                🎯 Função Principal: Admin monitora sistema → Instrutores recebem apostilas estáveis
              </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Downloads JW.org */}
              <Card className="bg-green-50 border-green-200">
              <CardHeader>
                  <CardTitle className="text-green-800">📚 JW.org Downloads</CardTitle>
                  <CardDescription className="text-green-700">
                    Gerenciar materiais oficiais
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Apostila MWB Atual:</span>
                    <Badge variant="outline" className="text-green-600">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Disponível
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Última verificação:</span>
                    <span className="text-sm text-green-700">Hoje, 10:30</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline" className="border-green-300 text-green-700" onClick={handleSyncCongregations}>
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Sincronizar com Congregações
                    </Button>
                    <Button size="sm" variant="outline" className="border-green-300 text-green-700" onClick={handleViewFullProgram}>
                      <Settings className="h-3 w-3 mr-1" />
                      Ver Programação Completa
                    </Button>
                </div>
              </CardContent>
            </Card>

              {/* Configurações Gerais */}
            <Card>
              <CardHeader>
                  <CardTitle>Configurações Gerais</CardTitle>
                <CardDescription>
                    Parâmetros do sistema
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Backup Automático:</span>
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Diário às 02:00
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Notificações:</span>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Email + Sistema
                    </Badge>
                    </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Manutenção:</span>
                    <span className="text-sm text-muted-foreground">Última: Ontem</span>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Settings className="h-3 w-3 mr-1" />
                      Configurar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Métricas do Sistema */}
            <Card>
              <CardHeader>
                <CardTitle>Métricas do Sistema</CardTitle>
                <CardDescription>
                  Monitoramento em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-3 border rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">99.9%</p>
                    <p className="text-sm text-muted-foreground">Uptime</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">~120ms</p>
                    <p className="text-sm text-muted-foreground">Latência</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">25%</p>
                    <p className="text-sm text-muted-foreground">CPU</p>
                  </div>
                  <div className="p-3 border rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">33%</p>
                    <p className="text-sm text-muted-foreground">Memória</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                    <div className="flex items-center justify-between">
                    <span className="text-sm">CPU:</span>
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div className="w-1/4 h-2 bg-green-500 rounded-full"></div>
                    </div>
                        <span className="text-sm">25%</span>
                  </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Memória:</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 h-2 bg-gray-200 rounded-full">
                          <div className="w-1/3 h-2 bg-blue-500 rounded-full"></div>
                    </div>
                        <span className="text-sm">33%</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Banco:</span>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm">Conectado</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

              {/* Logs e Atividades */}
              <Card>
                <CardHeader>
                  <CardTitle>Logs Recentes</CardTitle>
                  <CardDescription>
                    Últimas atividades do sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-start space-x-3 p-2 border rounded-lg">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Sistema iniciado</p>
                        <p className="text-xs text-muted-foreground">Hoje, 08:00</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-2 border rounded-lg">
                      <Activity className="h-4 w-4 text-blue-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Backup automático executado</p>
                        <p className="text-xs text-muted-foreground">Hoje, 02:00</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-2 border rounded-lg">
                      <Users className="h-4 w-4 text-green-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Novo usuário registrado</p>
                        <p className="text-xs text-muted-foreground">Ontem, 16:30</p>
                      </div>
                    </div>

                    <div className="flex items-start space-x-3 p-2 border rounded-lg">
                      <AlertCircle className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Manutenção programada</p>
                        <p className="text-xs text-muted-foreground">Ontem, 03:00</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Button variant="outline" className="w-full" onClick={handleViewAllLogs}>
                      <FileText className="h-4 w-4 mr-2" />
                      Ver Todos os Logs
                    </Button>
                  </div>
                </CardContent>
              </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
*/
