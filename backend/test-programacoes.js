const fetch = require('node-fetch');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

// Payload de exemplo baseado na especificação
const samplePayload = {
  week_start: '2025-11-03',
  week_end: '2025-11-09',
  status: 'publicada',
  congregation_scope: 'global',
  items: [
    {
      order: 1,
      section: 'OPENING',
      type: 'song',
      minutes: 3,
      rules: null,
      lang: {
        en: { title: 'Song 1' },
        pt: { title: 'Cântico 1' }
      }
    },
    {
      order: 2,
      section: 'OPENING',
      type: 'opening_comments',
      minutes: 3,
      rules: null,
      lang: {
        en: { title: 'Opening Comments', notes: 'Welcome and announcements' },
        pt: { title: 'Comentários Iniciais', notes: 'Boas-vindas e anúncios' }
      }
    },
    {
      order: 3,
      section: 'TREASURES',
      type: 'talk',
      minutes: 10,
      rules: { eligible_roles: ['elder', 'ministerial_servant'] },
      lang: {
        en: { title: 'Treasures Talk', notes: 'Bible study highlights' },
        pt: { title: 'Discurso dos Tesouros', notes: 'Destaques do estudo bíblico' }
      }
    },
    {
      order: 4,
      section: 'TREASURES',
      type: 'spiritual_gems',
      minutes: 10,
      rules: { eligible_roles: ['elder', 'ministerial_servant'] },
      lang: {
        en: { title: 'Spiritual Gems' },
        pt: { title: 'Joias Espirituais' }
      }
    },
    {
      order: 5,
      section: 'TREASURES',
      type: 'bible_reading',
      minutes: 4,
      rules: { eligible_roles: ['brother'] },
      lang: {
        en: { title: 'Bible Reading' },
        pt: { title: 'Leitura da Bíblia' }
      }
    },
    {
      order: 6,
      section: 'APPLY',
      type: 'starting',
      minutes: 3,
      rules: { eligible_roles: ['brother', 'sister'] },
      lang: {
        en: { title: 'Starting Conversation' },
        pt: { title: 'Iniciando Conversas' }
      }
    },
    {
      order: 7,
      section: 'APPLY',
      type: 'following',
      minutes: 4,
      rules: { eligible_roles: ['brother', 'sister'] },
      lang: {
        en: { title: 'Following Up' },
        pt: { title: 'Revisitas' }
      }
    },
    {
      order: 8,
      section: 'APPLY',
      type: 'making_disciples',
      minutes: 5,
      rules: { eligible_roles: ['brother', 'sister'] },
      lang: {
        en: { title: 'Making Disciples' },
        pt: { title: 'Fazendo Discípulos' }
      }
    },
    {
      order: 9,
      section: 'LIVING',
      type: 'local_needs',
      minutes: 15,
      rules: { eligible_roles: ['elder'] },
      lang: {
        en: { title: 'Local Needs' },
        pt: { title: 'Necessidades Locais' }
      }
    },
    {
      order: 10,
      section: 'LIVING',
      type: 'cbs',
      minutes: 30,
      rules: { eligible_roles: ['elder', 'ministerial_servant'] },
      lang: {
        en: { title: 'Congregation Bible Study' },
        pt: { title: 'Estudo Bíblico de Congregação' }
      }
    },
    {
      order: 11,
      section: 'CLOSING',
      type: 'concluding_comments',
      minutes: 3,
      rules: { eligible_roles: ['elder'] },
      lang: {
        en: { title: 'Concluding Comments' },
        pt: { title: 'Comentários Finais' }
      }
    },
    {
      order: 12,
      section: 'CLOSING',
      type: 'song',
      minutes: 3,
      rules: null,
      lang: {
        en: { title: 'Song 2' },
        pt: { title: 'Cântico 2' }
      }
    }
  ]
};

async function testBackend() {
  console.log('🧪 Testando Backend Express + Supabase...\n');

  try {
    // 1. Testar status
    console.log('1️⃣ Testando status...');
    const statusResponse = await fetch(`${BASE_URL}/api/status`);
    const statusData = await statusResponse.json();
    console.log('✅ Status:', statusData);
    console.log('');

    // 2. Publicar programação
    console.log('2️⃣ Publicando programação...');
    const postResponse = await fetch(`${BASE_URL}/api/programacoes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(samplePayload)
    });
    
    if (!postResponse.ok) {
      const errorText = await postResponse.text();
      throw new Error(`POST failed: ${postResponse.status} - ${errorText}`);
    }
    
    const postData = await postResponse.json();
    console.log('✅ Programação criada:', {
      id: postData.programacao?.id,
      week: `${postData.programacao?.week_start} - ${postData.programacao?.week_end}`,
      status: postData.programacao?.status,
      items_count: postData.itens?.length
    });
    console.log('');

    // 3. Obter programação
    console.log('3️⃣ Obtendo programação...');
    const getResponse = await fetch(`${BASE_URL}/api/programacoes?week_start=2025-11-03&week_end=2025-11-09`);
    
    if (!getResponse.ok) {
      const errorText = await getResponse.text();
      throw new Error(`GET failed: ${getResponse.status} - ${errorText}`);
    }
    
    const getData = await getResponse.json();
    console.log('✅ Programação obtida:', {
      id: getData.programacao?.id,
      week: `${getData.programacao?.week_start} - ${getData.programacao?.week_end}`,
      status: getData.programacao?.status,
      items_count: getData.items?.length
    });
    
    // Mostrar alguns itens
    if (getData.items && getData.items.length > 0) {
      console.log('📋 Primeiros 3 itens:');
      getData.items.slice(0, 3).forEach(item => {
        console.log(`  - ${item.order}: ${item.lang.pt.title} (${item.minutes}min)`);
      });
    }
    console.log('');

    console.log('🎉 Todos os testes passaram! Backend funcionando corretamente.');

  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    process.exit(1);
  }
}

// Executar testes
if (require.main === module) {
  testBackend();
}

module.exports = { testBackend, samplePayload };
