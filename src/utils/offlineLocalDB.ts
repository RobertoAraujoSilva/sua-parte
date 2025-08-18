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
        partes,
        status,
        assignment_status,
        updated_at,
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

    const programs = (programas || []).map(p => ({
      id: p.id,
      data_inicio_semana: p.data_inicio_semana,
      mes_apostila: p.mes_apostila,
      partes: p.partes,
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
image.png
// Outbox types and interfaces
export interface OutboxOperation {
  id: string;
  entity: 'estudantes' | 'programas' | 'designacoes';
  operation: 'create' | 'update' | 'delete';
  data: any;
  entityId: string;
  timestamp: number;
  status: 'pending' | 'synced' | 'failed';
  retryCount: number;
  lastError?: string;
  revision?: number;
}

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: Array<{ operationId: string; error: string }>;
}

// Add operation to outbox
export async function addToOutbox(operation: Omit<OutboxOperation, 'id' | 'timestamp' | 'status' | 'retryCount'>): Promise<string> {
  const db = await openDB();
  const transaction = tx(db, 'outbox', 'readwrite');
  const store = transaction.objectStore('outbox');
  
  const outboxOp: OutboxOperation = {
    ...operation,
    id: crypto.randomUUID(),
    timestamp: Date.now(),
    status: 'pending',
    retryCount: 0
  };
  
  await new Promise<void>((resolve, reject) => {
    const request = store.add(outboxOp);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  
  console.log(`📤 Added ${operation.operation} operation for ${operation.entity}:${operation.entityId} to outbox`);
  return outboxOp.id;
}

// Get pending operations from outbox
export async function getPendingOperations(): Promise<OutboxOperation[]> {
  const db = await openDB();
  const transaction = tx(db, 'outbox', 'readonly');
  const store = transaction.objectStore('outbox');
  
  return new Promise<OutboxOperation[]>((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = () => {
      const operations = request.result.filter((op: OutboxOperation) => op.status === 'pending');
      resolve(operations.sort((a, b) => a.timestamp - b.timestamp));
    };
    request.onerror = () => reject(request.error);
  });
}

// Update operation status in outbox
export async function updateOperationStatus(
  operationId: string, 
  status: OutboxOperation['status'], 
  error?: string
): Promise<void> {
  const db = await openDB();
  const transaction = tx(db, 'outbox', 'readwrite');
  const store = transaction.objectStore('outbox');
  
  return new Promise<void>((resolve, reject) => {
    const getRequest = store.get(operationId);
    getRequest.onsuccess = () => {
      const operation = getRequest.result;
      if (operation) {
        operation.status = status;
        if (error) {
          operation.lastError = error;
          operation.retryCount = (operation.retryCount || 0) + 1;
        }
        
        const putRequest = store.put(operation);
        putRequest.onsuccess = () => resolve();
        putRequest.onerror = () => reject(putRequest.error);
      } else {
        reject(new Error(`Operation ${operationId} not found`));
      }
    };
    getRequest.onerror = () => reject(getRequest.error);
  });
}

// Local-first operations
export async function createLocalFirst(
  entity: 'estudantes' | 'programas' | 'designacoes',
  data: any
): Promise<string> {
  // Generate temporary ID for immediate local use
  const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const entityWithId = { ...data, id: tempId };
  
  // Store locally immediately
  await putMany(STORES[entity], [entityWithId]);
  
  // Add to outbox for later sync
  await addToOutbox({
    entity,
    operation: 'create',
    data: entityWithId,
    entityId: tempId
  });
  
  console.log(`✅ Created ${entity} locally with temp ID: ${tempId}`);
  return tempId;
}

export async function updateLocalFirst(
  entity: 'estudantes' | 'programas' | 'designacoes',
  id: string,
  data: any
): Promise<void> {
  // Update locally immediately
  const updatedData = { ...data, id, updated_at: new Date().toISOString() };
  await putMany(STORES[entity], [updatedData]);
  
  // Add to outbox for later sync
  await addToOutbox({
    entity,
    operation: 'update',
    data: updatedData,
    entityId: id
  });
  
  console.log(`✅ Updated ${entity}:${id} locally`);
}

export async function deleteLocalFirst(
  entity: 'estudantes' | 'programas' | 'designacoes',
  id: string
): Promise<void> {
  // Mark as deleted locally (soft delete)
  const deletedData = { id, deleted_at: new Date().toISOString() };
  await putMany(STORES[entity], [deletedData]);
  
  // Add to outbox for later sync
  await addToOutbox({
    entity,
    operation: 'delete',
    data: deletedData,
    entityId: id
  });
  
  console.log(`✅ Deleted ${entity}:${id} locally`);
}

// Replace the placeholder syncOutbox function
export async function syncOutbox(): Promise<SyncResult> {
  console.log('🔄 Starting outbox synchronization...');
  
  const pendingOps = await getPendingOperations();
  if (pendingOps.length === 0) {
    console.log('✅ No pending operations to sync');
    return { success: true, syncedCount: 0, failedCount: 0, errors: [] };
  }
  
  console.log(`📤 Found ${pendingOps.length} pending operations`);
  
  let syncedCount = 0;
  let failedCount = 0;
  const errors: Array<{ operationId: string; error: string }> = [];
  
  for (const operation of pendingOps) {
    try {
      console.log(`🔄 Syncing ${operation.operation} ${operation.entity}:${operation.entityId}`);
      
      let result;
      const tableName = operation.entity;
      
      switch (operation.operation) {
        case 'create':
          // Remove temp ID and let Supabase generate real ID
          const { id: tempId, ...createData } = operation.data;
          result = await supabase
            .from(tableName)
            .insert(createData)
            .select()
            .single();
          
          if (result.error) throw result.error;
          
          // Update local data with real ID from server
          if (result.data) {
            await putMany(STORES[operation.entity], [result.data]);
            console.log(`✅ Created ${operation.entity} with real ID: ${result.data.id}`);
          }
          break;
          
        case 'update':
          // Check for conflicts using revision if available
          if (operation.revision) {
            const { data: currentData } = await supabase
              .from(tableName)
              .select('revision')
              .eq('id', operation.entityId)
              .single();
              
            if (currentData && currentData.revision > operation.revision) {
              throw new Error(`Conflict: Server revision ${currentData.revision} > local revision ${operation.revision}`);
            }
          }
          
          result = await supabase
            .from(tableName)
            .update(operation.data)
            .eq('id', operation.entityId)
            .select()
            .single();
            
          if (result.error) throw result.error;
          
          // Update local data with server response
          if (result.data) {
            await putMany(STORES[operation.entity], [result.data]);
            console.log(`✅ Updated ${operation.entity}:${operation.entityId}`);
          }
          break;
          
        case 'delete':
          result = await supabase
            .from(tableName)
            .update({ deleted_at: operation.data.deleted_at })
            .eq('id', operation.entityId);
            
          if (result.error) throw result.error;
          console.log(`✅ Deleted ${operation.entity}:${operation.entityId}`);
          break;
      }
      
      // Mark operation as synced
      await updateOperationStatus(operation.id, 'synced');
      syncedCount++;
      
    } catch (error) {
      console.error(`❌ Failed to sync ${operation.operation} ${operation.entity}:${operation.entityId}:`, error);
      
      const errorMessage = error instanceof Error ? error.message : String(error);
      errors.push({ operationId: operation.id, error: errorMessage });
      
      // Mark operation as failed (with retry logic)
      if (operation.retryCount < 3) {
        await updateOperationStatus(operation.id, 'pending', errorMessage);
      } else {
        await updateOperationStatus(operation.id, 'failed', errorMessage);
        failedCount++;
      }
    }
  }
  
  const result: SyncResult = {
    success: failedCount === 0,
    syncedCount,
    failedCount,
    errors
  };
  
  console.log(`🔄 Sync completed: ${syncedCount} synced, ${failedCount} failed`);
  return result;
}

// Get outbox status for UI
export async function getOutboxStatus(): Promise<{
  pendingCount: number;
  failedCount: number;
  lastSyncTime?: number;
}> {
  const operations = await getAll('outbox');
  const pending = operations.filter(op => op.status === 'pending').length;
  const failed = operations.filter(op => op.status === 'failed').length;
  
  return {
    pendingCount: pending,
    failedCount: failed,
    lastSyncTime: operations.length > 0 ? Math.max(...operations.map(op => op.timestamp)) : undefined
  };
}

p// Delta download using cursors for efficiency (MCP-03.2)
export async function downloadIncrementalData(): Promise<{
  success: boolean;
  downloaded: { estudantes: number; programas: number; designacoes: number };
  errors?: string[];
}> {
  try {
    console.log('🔄 Iniciando download incremental...');
    const errors: string[] = [];
    const downloaded = { estudantes: 0, programas: 0, designacoes: 0 };

    // 1) Estudantes incrementais
    try {
      const estudantesCursor = await getCursor('estudantes');
      const { data: estudantes, error: errEst } = await supabase
        .from('estudantes')
        .select('*')
        .gt('updated_at', estudantesCursor || '1970-01-01T00:00:00Z')
        .order('updated_at', { ascending: true });
      
      if (errEst) throw errEst;
      
      if (estudantes && estudantes.length > 0) {
        await putMany(STORES.estudantes, estudantes.map(e => ({ 
          ...e, 
          updated_at: e.updated_at || new Date().toISOString() 
        })));
        
        // Update cursor to the latest updated_at
        const latestUpdatedAt = estudantes[estudantes.length - 1].updated_at;
        await setCursor('estudantes', latestUpdatedAt);
        downloaded.estudantes = estudantes.length;
        console.log(`✅ Estudantes incrementais: ${estudantes.length}`);
      }
    } catch (error) {
      console.error('❌ Erro no download incremental de estudantes:', error);
      errors.push(`Estudantes: ${error}`);
    }

    // 2) Programas incrementais
    try {
      const programasCursor = await getCursor('programas');
      const { data: programas, error: errProg } = await supabase
        .from('programas')
        .select('*')
        .gt('updated_at', programasCursor || '1970-01-01T00:00:00Z')
        .order('updated_at', { ascending: true });
      
      if (errProg) throw errProg;
      
      if (programas && programas.length > 0) {
        const programs = programas.map(p => ({
          id: p.id,
          data_inicio_semana: p.data_inicio_semana,
          mes_apostila: p.mes_apostila,
          partes: p.partes,
          status: p.status,
          assignment_status: p.assignment_status,
          updated_at: p.updated_at || new Date().toISOString(),
        }));
        
        await putMany(STORES.programas, programs);
        
        // Update cursor to the latest updated_at
        const latestUpdatedAt = programas[programas.length - 1].updated_at;
        await setCursor('programas', latestUpdatedAt);
        downloaded.programas = programas.length;
        console.log(`✅ Programas incrementais: ${programas.length}`);
      }
    } catch (error) {
      console.error('❌ Erro no download incremental de programas:', error);
      errors.push(`Programas: ${error}`);
    }

    // 3) Designações incrementais
    try {
      const designacoesCursor = await getCursor('designacoes');
      const { data: designacoes, error: errDes } = await supabase
        .from('designacoes')
        .select('*')
        .gt('updated_at', designacoesCursor || '1970-01-01T00:00:00Z')
        .order('updated_at', { ascending: true });
      
      if (errDes) throw errDes;
      
      if (designacoes && designacoes.length > 0) {
        const designacoesWithUpdatedAt = designacoes.map(d => ({
          ...d,
          updated_at: d.updated_at || new Date().toISOString(),
        }));
        
        await putMany(STORES.designacoes, designacoesWithUpdatedAt);
        
        // Update cursor to the latest updated_at
        const latestUpdatedAt = designacoes[designacoes.length - 1].updated_at;
        await setCursor('designacoes', latestUpdatedAt);
        downloaded.designacoes = designacoes.length;
        console.log(`✅ Designações incrementais: ${designacoes.length}`);
      }
    } catch (error) {
      console.error('❌ Erro no download incremental de designações:', error);
      errors.push(`Designações: ${error}`);
    }

    const totalDownloaded = downloaded.estudantes + downloaded.programas + downloaded.designacoes;
    
    if (errors.length === 0) {
      console.log(`✅ Download incremental concluído: ${totalDownloaded} registros atualizados`);
      return { success: true, downloaded };
    } else {
      console.log(`⚠️ Download incremental parcial: ${totalDownloaded} registros, ${errors.length} erros`);
      return { success: false, downloaded, errors };
    }
    
  } catch (error) {
    console.error('❌ Erro geral no download incremental:', error);
    return { 
      success: false, 
      downloaded: { estudantes: 0, programas: 0, designacoes: 0 }, 
      errors: [`Erro geral: ${error}`] 
    };
  }
}

// Helper function to get cursor information for debugging
export async function getCursorInfo(): Promise<{
  estudantes: string | null;
  programas: string | null;
  designacoes: string | null;
}> {
  return {
    estudantes: await getCursor('estudantes'),
    programas: await getCursor('programas'),
    designacoes: await getCursor('designacoes'),
  };
}

// ... existing code ...

// Expose helpers on window for manual testing
if (typeof window !== 'undefined') {
  (window as any).offlineDB = {
    download: downloadDataForOffline,
    downloadIncremental: downloadIncrementalData,  // New incremental download
    list: listOffline,
    sync: syncOutbox,
    // Add new outbox helpers
    createLocal: createLocalFirst,
    updateLocal: updateLocalFirst,
    deleteLocal: deleteLocalFirst,
    getOutboxStatus,
    getPendingOps: getPendingOperations,
    getCursors: getCursorInfo,  // New cursor info helper
  };
  console.log('🔧 Offline DB tools available: window.offlineDB.download(), window.offlineDB.downloadIncremental(), window.offlineDB.list(\'estudantes\'), window.offlineDB.sync()');
  console.log('🔧 Outbox tools: window.offlineDB.createLocal(), window.offlineDB.getOutboxStatus(), window.offlineDB.getPendingOps()');
  console.log('🔧 Cursor tools: window.offlineDB.getCursors()');
}
