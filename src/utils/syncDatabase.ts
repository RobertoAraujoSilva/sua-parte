import { supabase } from '@/integrations/supabase/client';

// Dados do banco conforme fornecido - apenas os primeiros 5 registros para teste
const databaseData = [
  {
    id: 'f7f68ebe-73b0-4c08-a0ed-32bf9383180d',
    nome: 'João Felipe Aragão',
    familia: 'Aragao',
    idade: 61,
    genero: 'masculino',
    email: 'kpires@fogaca.com',
    telefone: '51 2281 0032',
    data_batismo: '2007-01-14',
    cargo: 'publicador_batizado',
    ativo: true,
    observacoes: 'Saepe nisi alias harum.',
    chairman: false,
    pray: false,
    tresures: false,
    gems: false,
    reading: true,
    starting: true,
    following: true,
    making: true,
    explaining: true,
    talk: true
  },
  {
    id: '6a4ad5b3-3b89-4859-b5aa-d7785e32a531',
    nome: 'Juliana Azevedo',
    familia: 'Azevedo',
    idade: 69,
    genero: 'feminino',
    email: 'sarahnovaes@yahoo.com.br',
    telefone: '(051) 9942 4946',
    data_batismo: null,
    cargo: 'estudante_novo',
    ativo: true,
    observacoes: 'Quas commodi corporis vitae doloribus minima.',
    chairman: false,
    pray: false,
    tresures: false,
    gems: false,
    reading: true,
    starting: true,
    following: true,
    making: true,
    explaining: true,
    talk: false
  },
  {
    id: 'afffabdb-3f2a-4b49-bc73-3b2787d15f04',
    nome: 'Maria Eduarda Barbosa',
    familia: 'Barbosa',
    idade: 33,
    genero: 'feminino',
    email: 'gabriela12@hotmail.com',
    telefone: '(051) 7206-3990',
    data_batismo: null,
    cargo: 'estudante_novo',
    ativo: true,
    observacoes: 'Odio architecto facere qui iure dicta modi.',
    chairman: false,
    pray: false,
    tresures: false,
    gems: false,
    reading: true,
    starting: true,
    following: true,
    making: true,
    explaining: true,
    talk: false
  },
  {
    id: '254a5820-339a-4a80-a940-bc199fbfd69b',
    nome: 'Benjamin Barros',
    familia: 'Barros',
    idade: 61,
    genero: 'masculino',
    email: 'rodriguesclara@castro.com',
    telefone: '0900-715-4758',
    data_batismo: '1998-07-25',
    cargo: 'anciao',
    ativo: true,
    observacoes: 'Ut fugiat eveniet.',
    chairman: true,
    pray: true,
    tresures: true,
    gems: true,
    reading: true,
    starting: true,
    following: true,
    making: true,
    explaining: true,
    talk: true
  },
  {
    id: '167bcc70-8f46-4b43-91e8-2a92d2daa53d',
    nome: 'Yago Barros',
    familia: 'Barros',
    idade: 45,
    genero: 'masculino',
    email: 'maria-juliasouza@uol.com.br',
    telefone: '(084) 7785 2970',
    data_batismo: '2020-06-21',
    cargo: 'anciao',
    ativo: true,
    observacoes: 'Ullam dolor incidunt maxime excepturi quidem.',
    chairman: true,
    pray: true,
    tresures: true,
    gems: true,
    reading: true,
    starting: true,
    following: true,
    making: true,
    explaining: true,
    talk: true
  }
];

export const syncDatabaseData = async () => {
  try {
    console.log('Iniciando sincronização dos dados...');
    
    // Primeiro, atualizar o Franklin para ter a mesma congregação do instrutor
    const { error: franklinError } = await supabase
      .from('estudantes')
      .update({ 
        congregacao: 'Market Harborough'
      })
      .eq('id', 'd4036a52-2e89-4d79-9e4a-593e7f9fc1af');
    
    if (franklinError) {
      console.error('Erro ao atualizar Franklin:', franklinError);
    } else {
      console.log('✓ Franklin atualizado com congregação Market Harborough');
    }
    
    // Atualizar todos os estudantes existentes para ter a mesma congregação
    const { error: updateAllError } = await supabase
      .from('estudantes')
      .update({ congregacao: 'Market Harborough' })
      .eq('user_id', '094883b0-6a5b-4594-a433-b2deb506739d');
    
    if (updateAllError) {
      console.error('Erro ao atualizar congregação dos estudantes:', updateAllError);
    } else {
      console.log('✓ Todos os estudantes atualizados com congregação Market Harborough');
    }
    
    // Buscar dados atuais do banco
    const { data: currentData, error: fetchError } = await supabase
      .from('estudantes')
      .select('*');
    
    if (fetchError) {
      console.error('Erro ao buscar dados atuais:', fetchError);
      return false;
    }
    
    console.log(`Encontrados ${currentData?.length || 0} registros no banco`);
    console.log(`Dados de referência: ${databaseData.length} registros`);
    
    // Atualizar cada registro com os dados corretos
    for (const refData of databaseData) {
      const currentRecord = currentData?.find(record => record.id === refData.id);
      
      if (currentRecord) {
        // Verificar se há diferenças
        const needsUpdate = 
          currentRecord.nome !== refData.nome ||
          currentRecord.familia !== refData.familia ||
          currentRecord.idade !== refData.idade ||
          currentRecord.genero !== refData.genero ||
          currentRecord.email !== refData.email ||
          currentRecord.telefone !== refData.telefone ||
          currentRecord.data_batismo !== refData.data_batismo ||
          currentRecord.cargo !== refData.cargo ||
          currentRecord.ativo !== refData.ativo ||
          currentRecord.observacoes !== refData.observacoes ||
          currentRecord.chairman !== refData.chairman ||
          currentRecord.pray !== refData.pray ||
          currentRecord.tresures !== refData.tresures ||
          currentRecord.gems !== refData.gems ||
          currentRecord.reading !== refData.reading ||
          currentRecord.starting !== refData.starting ||
          currentRecord.following !== refData.following ||
          currentRecord.making !== refData.making ||
          currentRecord.explaining !== refData.explaining ||
          currentRecord.talk !== refData.talk;
        
        if (needsUpdate) {
          console.log(`Atualizando registro: ${refData.nome}`);
          
          const { error: updateError } = await supabase
            .from('estudantes')
            .update({
              nome: refData.nome,
              familia: refData.familia,
              idade: refData.idade,
              genero: refData.genero,
              email: refData.email,
              telefone: refData.telefone,
              data_batismo: refData.data_batismo,
              cargo: refData.cargo,
              ativo: refData.ativo,
              observacoes: refData.observacoes,
              chairman: refData.chairman,
              pray: refData.pray,
              tresures: refData.tresures,
              gems: refData.gems,
              reading: refData.reading,
              starting: refData.starting,
              following: refData.following,
              making: refData.making,
              explaining: refData.explaining,
              talk: refData.talk,
              updated_at: new Date().toISOString()
            })
            .eq('id', refData.id);
          
          if (updateError) {
            console.error(`Erro ao atualizar ${refData.nome}:`, updateError);
          } else {
            console.log(`✓ ${refData.nome} atualizado com sucesso`);
          }
        } else {
          console.log(`- ${refData.nome} já está sincronizado`);
        }
      } else {
        console.log(`Registro não encontrado: ${refData.nome} (${refData.id})`);
      }
    }
    
    console.log('Sincronização concluída!');
    return true;
    
  } catch (error) {
    console.error('Erro durante a sincronização:', error);
    return false;
  }
};