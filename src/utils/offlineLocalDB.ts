/*
 * Offline Local Database (IndexedDB)
 * MCP-02: Initial scaffolding for offline cache of estudantes, programas e designações
 * - Provides: basic schema, bulk put/get, and a function to download data for offline use
 * - Non-invasive: exposes helpers on window.offlineDB for manual testing
 */

import { supabase } from '@/integrations/supabase/client';

const DB_NAME = 'sua_parte_offline';
const DB_VERSION = 1;

// Object store names
const STORES = {
  estudantes: 'estudantes',
  programas: 'programas',
  designacoes: 'designacoes',
  outbox: 'outbox',
  cursors: 'cursors',
} as const;

type StoreName = typeof STORES[keyof typeof STORES];

type IDBDatabaseEx = IDBDatabase & { __version?: number };

function openDB(): Promise<IDBDatabaseEx> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);

    req.onupgradeneeded = () => {
      const db = req.result as IDBDatabaseEx;

      // estudantes
      if (!db.objectStoreNames.contains(STORES.estudantes)) {
        const s = db.createObjectStore(STORES.estudantes, { keyPath: 'id' });
        s.createIndex('updated_at', 'updated_at', { unique: false });
      }

      // programas
      if (!db.objectStoreNames.contains(STORES.programas)) {
        const s = db.createObjectStore(STORES.programas, { keyPath: 'id' });
        s.createIndex('updated_at', 'updated_at', { unique: false });
      }

      // designacoes
      if (!db.objectStoreNames.contains(STORES.designacoes)) {
        const s = db.createObjectStore(STORES.designacoes, { keyPath: 'id' });
        s.createIndex('programa_id', 'programa_id', { unique: false });
        s.createIndex('updated_at', 'updated_at', { unique: false });
      }

      // outbox (pending local ops)
      if (!db.objectStoreNames.contains(STORES.outbox)) {
        db.createObjectStore(STORES.outbox, { keyPath: 'id', autoIncrement: true });
      }

      // cursors (delta sync checkpoints per entity)
      if (!db.objectStoreNames.contains(STORES.cursors)) {
        db.createObjectStore(STORES.cursors, { keyPath: 'entity' });
      }
    };

    req.onsuccess = () => resolve(req.result as IDBDatabaseEx);
    req.onerror = () => reject(req.error);
  });
}

function tx(db: IDBDatabase, storeNames: StoreName | StoreName[], mode: IDBTransactionMode = 'readonly') {
  const names = Array.isArray(storeNames) ? storeNames : [storeNames];
  return db.transaction(names, mode);
}

async function putMany(store: StoreName, items: any[]) {
  const db = await openDB();
  const t = tx(db, store, 'readwrite');
  const s = t.objectStore(store);
  await Promise.all(items.map(item => new Promise<void>((resolve, reject) => {
    const req = s.put(item);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  })));
  await new Promise<void>((resolve, reject) => {
    t.oncomplete = () => resolve();
    t.onerror = () => reject(t.error);
  });
}

async function getAll(store: StoreName): Promise<any[]> {
  const db = await openDB();
  const t = tx(db, store, 'readonly');
  const s = t.objectStore(store);
  return new Promise((resolve, reject) => {
    const req = s.getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function setCursor(entity: string, value: string) {
  const db = await openDB();
  const t = tx(db, STORES.cursors, 'readwrite');
  const s = t.objectStore(STORES.cursors);
  await new Promise<void>((resolve, reject) => {
    const req = s.put({ entity, value, updated_at: new Date().toISOString() });
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function getCursor(entity: string): Promise<string | null> {
  const db = await openDB();
  const t = tx(db, STORES.cursors, 'readonly');
  const s = t.objectStore(STORES.cursors);
  return new Promise((resolve, reject) => {
    const req = s.get(entity);
    req.onsuccess = () => resolve(req.result?.value ?? null);
    req.onerror = () => reject(req.error);
  });
}

// Basic download to seed offline cache (full fetch; delta sync comes later)
export async function downloadDataForOffline() {
  try {
    console.log('⬇️ Baixando dados para uso offline...');

    // 1) Estudantes
    const { data: estudantes, error: errEst } = await supabase
      .from('estudantes')
      .select('*');
    if (errEst) throw errEst;
    await putMany(STORES.estudantes, (estudantes || []).map(e => ({ ...e, updated_at: e.updated_at || new Date().toISOString() })));
    await setCursor('estudantes', new Date().toISOString());

    // 2) Programas + designacoes (flatten designacoes with programa_id)
    const { data: programas, error: errProg } = await supabase
      .from('programas')
      .select(`
          id,
          data_inicio_semana,
          mes_apostila,
          status,
          assignment_status,
          updated_at,
          conteudo,
          designacoes:designacoes (
            id,
            id_estudante,
            numero_parte,
            titulo_parte,
            tipo_parte,
            cena,
            tempo_minutos,
            id_ajudante,
            confirmado,
            updated_at
          )
        `)
      .order('data_inicio_semana', { ascending: false });
    if (errProg) throw errProg;

    const programs = (programas || []).map((p: any) => ({
      id: p.id,
      data_inicio_semana: p.data_inicio_semana,
      mes_apostila: p.mes_apostila,
      conteudo: p.conteudo,
      status: p.status,
      assignment_status: p.assignment_status,
      updated_at: p.updated_at || new Date().toISOString(),
    }));
    await putMany(STORES.programas, programs);

    const designacoes = (programas || []).flatMap((p: any) => (p.designacoes || []).map((d: any) => ({
      ...d,
      programa_id: p.id,
      updated_at: d.updated_at || new Date().toISOString(),
    })));
    await putMany(STORES.designacoes, designacoes);

    await setCursor('programas', new Date().toISOString());
    await setCursor('designacoes', new Date().toISOString());

    console.log('✅ Dados offline atualizados:', {
      estudantes: estudantes?.length || 0,
      programas: programs.length,
      designacoes: designacoes.length,
    });
    return true;
  } catch (error) {
    console.error('❌ Erro ao baixar dados para offline:', error);
    return false;
  }
}

// Basic getters to validate cache via console
export async function listOffline(entity: 'estudantes' | 'programas' | 'designacoes') {
  return getAll(STORES[entity]);
}

// Placeholder for future sync upload logic
export async function syncOutbox() {
  // TODO: read outbox, push to server with revision checks, mark synced
  console.log('ℹ️ syncOutbox() ainda não implementado.');
}

// Expose helpers on window for manual testing
if (typeof window !== 'undefined') {
  (window as any).offlineDB = {
    download: downloadDataForOffline,
    list: listOffline,
    sync: syncOutbox,
  };
  console.log('🔧 Offline DB tools available: window.offlineDB.download(), window.offlineDB.list(\'estudantes\'), window.offlineDB.sync()');
}
