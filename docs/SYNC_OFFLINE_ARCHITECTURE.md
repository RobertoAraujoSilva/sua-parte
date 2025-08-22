# Synchronization and Offline Architecture
## Technical Specifications for Offline-First System

### 10. Offline Functionality Scope Validation

**Current Implementation Analysis:**

Based on our existing `offlineLocalDB.ts` and IndexedDB implementation from MCP-02:

#### Validated Offline Capabilities:
```typescript
// Current offline database structure (from offlineLocalDB.ts)
const STORES = {
  estudantes: 'estudantes',
  programas: 'programas', 
  designacoes: 'designacoes',
  outbox: 'outbox', // For pending sync operations
  metadata: 'metadata' // For sync state tracking
};
```

#### Enhanced Offline Schema for Role-Based System:
```typescript
// Enhanced offline database schema
interface OfflineDatabase {
  // Existing stores (validated working)
  estudantes: EstudanteOffline[];
  programas: ProgramaOffline[];
  designacoes: DesignacaoOffline[];
  
  // New stores for role-based system
  global_programming: GlobalProgrammingOffline[];
  workbook_versions: WorkbookVersionOffline[];
  user_profile: UserProfileOffline;
  
  // Enhanced sync management
  outbox: OutboxItem[];
  sync_metadata: SyncMetadata[];
  conflict_resolution: ConflictItem[];
}

// Enhanced outbox for role-based operations
interface OutboxItem {
  id: string;
  operation: 'insert' | 'update' | 'delete';
  table: string;
  data: any;
  user_role: 'admin' | 'instrutor' | 'estudante';
  congregation_scope?: string;
  global_scope?: boolean;
  created_at: string;
  retry_count: number;
  status: 'pending' | 'syncing' | 'failed' | 'completed';
}
```

#### Instrutor Offline Capabilities Implementation:
```typescript
// Enhanced offline functionality for Instrutors
export async function enableInstrutorOfflineMode(): Promise<void> {
  // Download congregation-specific data
  await downloadCongregationData();
  
  // Download published global programming
  await downloadGlobalProgramming();
  
  // Cache user profile and permissions
  await cacheUserProfile();
  
  // Enable offline editing
  await enableOfflineEditing();
}

export async function downloadCongregationData(): Promise<void> {
  const { data: estudantes } = await supabase
    .from('estudantes')
    .select('*')
    .eq('congregacao', userProfile.congregacao);
  
  const { data: programas } = await supabase
    .from('programas')
    .select('*')
    .eq('user_id', userProfile.id);
  
  const { data: designacoes } = await supabase
    .from('designacoes')
    .select('*, estudante:estudantes(*), ajudante:estudantes(*)')
    .in('id_programa', programas.map(p => p.id));
  
  // Store in IndexedDB
  await storeOfflineData('estudantes', estudantes);
  await storeOfflineData('programas', programas);
  await storeOfflineData('designacoes', designacoes);
}

export async function downloadGlobalProgramming(): Promise<void> {
  const { data: globalProgramming } = await supabase
    .from('global_programming')
    .select('*')
    .eq('status', 'published')
    .gte('week_start_date', getThreeMonthsAgo())
    .lte('week_start_date', getThreeMonthsAhead());
  
  await storeOfflineData('global_programming', globalProgramming);
}
```

#### Offline Assignment Management:
```typescript
// Offline assignment operations
export async function createAssignmentOffline(
  assignmentData: any
): Promise<{ success: boolean; id: string }> {
  const tempId = generateTempId();
  
  // Store locally
  await storeOfflineData('designacoes', [{
    ...assignmentData,
    id: tempId,
    _offline_created: true,
    _sync_status: 'pending'
  }]);
  
  // Add to outbox
  await addToOutbox({
    operation: 'insert',
    table: 'designacoes',
    data: assignmentData,
    user_role: 'instrutor',
    congregation_scope: userProfile.congregacao
  });
  
  return { success: true, id: tempId };
}

export async function updateAssignmentOffline(
  id: string,
  updates: any
): Promise<{ success: boolean }> {
  // Update local data
  await updateOfflineData('designacoes', id, updates);
  
  // Add to outbox
  await addToOutbox({
    operation: 'update',
    table: 'designacoes',
    data: { id, ...updates },
    user_role: 'instrutor',
    congregation_scope: userProfile.congregacao
  });
  
  return { success: true };
}
```

### 11. Conflict Resolution Strategy

**Recommendation: Multi-Level Conflict Resolution with Role-Aware Logic**

Based on our existing `revision` system from MCP-05.1:

#### Conflict Detection Implementation:
```typescript
// Enhanced conflict detection
interface ConflictInfo {
  id: string;
  table: string;
  recordId: string;
  conflictType: 'revision' | 'concurrent_edit' | 'role_permission';
  localVersion: any;
  serverVersion: any;
  conflictFields: string[];
  resolutionStrategy: 'auto_merge' | 'manual_resolve' | 'server_wins' | 'local_wins';
  userRole: string;
  congregationScope?: string;
}

export async function detectSyncConflicts(
  outboxItems: OutboxItem[]
): Promise<ConflictInfo[]> {
  const conflicts: ConflictInfo[] = [];
  
  for (const item of outboxItems) {
    // Check revision conflicts
    const serverData = await fetchServerVersion(item.table, item.data.id);
    
    if (serverData && serverData.revision > item.data.revision) {
      const conflict = await analyzeConflict(item, serverData);
      conflicts.push(conflict);
    }
  }
  
  return conflicts;
}

async function analyzeConflict(
  localItem: OutboxItem,
  serverData: any
): Promise<ConflictInfo> {
  const conflictFields = findConflictingFields(localItem.data, serverData);
  
  // Determine resolution strategy based on conflict type and user role
  let resolutionStrategy: ConflictInfo['resolutionStrategy'] = 'manual_resolve';
  
  // Auto-merge for non-conflicting fields
  if (conflictFields.length === 0) {
    resolutionStrategy = 'auto_merge';
  }
  
  // Role-based resolution rules
  if (localItem.user_role === 'admin' && conflictFields.includes('global_content')) {
    resolutionStrategy = 'local_wins'; // Admin changes take precedence for global content
  }
  
  if (localItem.user_role === 'instrutor' && conflictFields.every(f => f.startsWith('local_'))) {
    resolutionStrategy = 'local_wins'; // Instrutor changes for local content
  }
  
  return {
    id: generateConflictId(),
    table: localItem.table,
    recordId: localItem.data.id,
    conflictType: 'revision',
    localVersion: localItem.data,
    serverVersion: serverData,
    conflictFields,
    resolutionStrategy,
    userRole: localItem.user_role,
    congregationScope: localItem.congregation_scope
  };
}
```

#### Automatic Conflict Resolution:
```typescript
export async function resolveConflictAutomatically(
  conflict: ConflictInfo
): Promise<{ success: boolean; resolution?: any }> {
  switch (conflict.resolutionStrategy) {
    case 'auto_merge':
      return await autoMergeConflict(conflict);
    
    case 'server_wins':
      return await applyServerVersion(conflict);
    
    case 'local_wins':
      return await applyLocalVersion(conflict);
    
    default:
      return { success: false }; // Requires manual resolution
  }
}

async function autoMergeConflict(conflict: ConflictInfo): Promise<{ success: boolean; resolution: any }> {
  const merged = { ...conflict.serverVersion };
  
  // Apply non-conflicting local changes
  Object.keys(conflict.localVersion).forEach(key => {
    if (!conflict.conflictFields.includes(key)) {
      merged[key] = conflict.localVersion[key];
    }
  });
  
  // Update revision to latest
  merged.revision = Math.max(
    conflict.localVersion.revision || 0,
    conflict.serverVersion.revision || 0
  ) + 1;
  
  return { success: true, resolution: merged };
}
```

#### Manual Conflict Resolution UI:
```typescript
// ConflictResolutionManager component
interface ConflictResolutionManagerProps {
  conflicts: ConflictInfo[];
  onResolve: (resolutions: ConflictResolution[]) => void;
}

const ConflictResolutionManager: React.FC<ConflictResolutionManagerProps> = ({
  conflicts,
  onResolve
}) => {
  const [resolutions, setResolutions] = useState<ConflictResolution[]>([]);
  
  const handleFieldResolution = (
    conflictId: string,
    field: string,
    choice: 'local' | 'server' | 'custom',
    customValue?: any
  ) => {
    // Update resolution for specific field
    setResolutions(prev => [
      ...prev.filter(r => r.conflictId !== conflictId || r.field !== field),
      { conflictId, field, choice, customValue }
    ]);
  };
  
  return (
    <div className="conflict-resolution-manager">
      {conflicts.map(conflict => (
        <ConflictResolutionCard
          key={conflict.id}
          conflict={conflict}
          onFieldResolve={handleFieldResolution}
        />
      ))}
      <Button onClick={() => onResolve(resolutions)}>
        Apply Resolutions
      </Button>
    </div>
  );
};
```

### 12. Admin Offline Requirements

**Recommendation: Limited Offline with Critical Operations Support**

#### Admin Offline Scope:
```typescript
// Admin offline capabilities (limited scope)
interface AdminOfflineCapabilities {
  // Read-only access to global programming
  viewGlobalProgramming: boolean;
  
  // Emergency editing capabilities
  emergencyEdit: boolean;
  
  // Workbook processing (offline parsing)
  workbookProcessing: boolean;
  
  // System monitoring (cached data)
  systemMonitoring: boolean;
  
  // Full admin operations require online
  fullAdminOperations: false;
}

export async function enableAdminOfflineMode(): Promise<void> {
  // Download essential global programming data
  await downloadGlobalProgrammingForOffline();
  
  // Cache workbook processing tools
  await cacheWorkbookProcessingTools();
  
  // Download system monitoring data
  await downloadSystemMetrics();
  
  // Enable limited offline editing
  await enableEmergencyEditMode();
}

// Emergency offline editing for critical fixes
export async function createEmergencyEdit(
  editData: any,
  justification: string
): Promise<{ success: boolean; emergencyId: string }> {
  const emergencyId = generateEmergencyId();
  
  // Store as high-priority outbox item
  await addToOutbox({
    operation: 'emergency_update',
    table: editData.table,
    data: editData,
    user_role: 'admin',
    global_scope: true,
    priority: 'high',
    justification,
    emergency_id: emergencyId
  });
  
  return { success: true, emergencyId };
}
```

#### Offline Database Schema for Admin:
```typescript
// Admin-specific offline schema
interface AdminOfflineDatabase {
  // Global programming (read-only cache)
  global_programming_cache: GlobalProgrammingOffline[];
  
  // Workbook processing cache
  workbook_processing_cache: WorkbookProcessingCache[];
  
  // System metrics cache
  system_metrics_cache: SystemMetricsCache[];
  
  // Emergency edits outbox
  emergency_outbox: EmergencyOutboxItem[];
  
  // Admin-specific sync metadata
  admin_sync_metadata: AdminSyncMetadata[];
}
```

### Integration with Existing Systems

#### MCP-02 (Current Offline System):
```typescript
// Enhanced sync function in offlineLocalDB.ts
export async function syncWithRoleAwareness(): Promise<SyncResult> {
  const userRole = await getCurrentUserRole();
  
  switch (userRole) {
    case 'admin':
      return await syncAdminData();
    case 'instrutor':
      return await syncInstrutorData();
    case 'estudante':
      return await syncEstudanteData();
    default:
      throw new Error('Unknown user role for sync');
  }
}

async function syncInstrutorData(): Promise<SyncResult> {
  // Sync congregation-scoped data
  const congregationScope = await getUserCongregation();
  
  // Download updates for congregation data
  await syncCongregationUpdates(congregationScope);
  
  // Upload local changes
  await uploadLocalChanges('instrutor', congregationScope);
  
  // Resolve conflicts
  const conflicts = await detectAndResolveConflicts();
  
  return {
    success: conflicts.length === 0,
    conflicts,
    syncedItems: await getOutboxCount()
  };
}
```

#### Connection Status Integration:
```typescript
// Enhanced connection status for role-based sync
export function useRoleBasedConnectionStatus() {
  const { role } = useUserRole();
  const baseStatus = useConnectionStatus();
  
  const [roleSpecificStatus, setRoleSpecificStatus] = useState({
    ...baseStatus,
    syncCapabilities: getSyncCapabilitiesForRole(role),
    offlineCapabilities: getOfflineCapabilitiesForRole(role)
  });
  
  return roleSpecificStatus;
}
```

### Performance Considerations

1. **Selective Sync**: Only sync data relevant to user role and congregation
2. **Incremental Updates**: Use revision system for efficient delta sync
3. **Conflict Batching**: Process multiple conflicts in single transaction
4. **Background Sync**: Automatic sync during idle periods
5. **Compression**: Compress large datasets for offline storage

### Security Considerations

1. **Role Validation**: All offline operations validate user role
2. **Data Encryption**: Sensitive offline data encrypted at rest
3. **Sync Authentication**: All sync operations require valid authentication
4. **Audit Trail**: Complete audit trail for offline operations and conflicts
5. **Emergency Procedures**: Secure emergency edit procedures for critical situations

This architecture ensures robust offline functionality while maintaining data integrity and security across all user roles in the Sistema Ministerial.
