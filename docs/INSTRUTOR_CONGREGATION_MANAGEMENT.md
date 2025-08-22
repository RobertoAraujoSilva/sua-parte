# Instrutor Congregation Management Architecture
## Local Assignment Management Technical Specifications

### 4. Programming Customization Scope

**Recommendation: Structured Customization with Inheritance Tracking**

Based on our current `programas` table and `GlobalProgrammingView.tsx` implementation, we recommend controlled customization:

#### Technical Implementation:
```sql
-- Enhanced programas table for global programming inheritance
ALTER TABLE programas 
ADD COLUMN global_programming_week_id UUID REFERENCES global_programming(week_start_date),
ADD COLUMN customization_level TEXT DEFAULT 'inherited' CHECK (
  customization_level IN ('inherited', 'timing_adjusted', 'locally_modified', 'fully_custom')
),
ADD COLUMN local_modifications JSONB,
ADD COLUMN inheritance_locked BOOLEAN DEFAULT false;
```

#### Code Implementation:
```typescript
// Add to GlobalProgrammingView.tsx
interface LocalCustomization {
  type: 'timing' | 'title' | 'requirements' | 'order' | 'visibility';
  originalValue: any;
  customValue: any;
  reason: string;
  customizedBy: string;
  customizedAt: string;
}

export async function customizeLocalProgramming(
  programaId: string,
  customizations: LocalCustomization[],
  instrutorId: string
): Promise<{ success: boolean; error?: string }> {
  // Validate instrutor permissions for this congregation
  // Apply customizations within permitted scope
  // Update customization_level based on changes
  // Maintain link to global programming source
}
```

#### Permitted Customizations:

1. **Timing Adjustments** (Level: `timing_adjusted`):
   ```typescript
   // Adjust part duration within ±5 minutes
   const timingCustomization: LocalCustomization = {
     type: 'timing',
     originalValue: 10, // minutes from global programming
     customValue: 12,   // local adjustment
     reason: 'Extra time needed for new students'
   };
   ```

2. **Student Assignment** (Level: `inherited`):
   - Assign local students to global programming parts
   - Maintain full traceability to global source

3. **Local Announcements** (Level: `locally_modified`):
   ```typescript
   // Add congregation-specific content
   const localContent = {
     type: 'announcement',
     content: 'Limpeza do Salão do Reino - Sábado 14h',
     position: 'after_part_3'
   };
   ```

4. **Part Visibility** (Level: `locally_modified`):
   - Hide parts not applicable to congregation
   - Cannot delete, only mark as `hidden: true`

#### Restrictions:
- Cannot modify global part structure or official content
- Cannot change part numbers or section organization
- Cannot edit official JW content (titles, references, requirements)
- All customizations must maintain link to global source

### 5. Data Isolation Verification

**Current RLS Implementation Validation:**

Our existing RLS policies in `applyComprehensiveRLS.ts` provide proper isolation:

```sql
-- Instrutor congregation isolation (current implementation)
CREATE POLICY "Instrutor can manage congregation programs"
  ON public.programas FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role = 'instrutor'
      AND (
        user_id = auth.uid() -- Own programs
        OR
        EXISTS ( -- Same congregation programs
          SELECT 1 FROM public.profiles p2
          WHERE p2.id = programas.user_id
          AND p2.congregacao = p.congregacao
          AND p.congregacao IS NOT NULL
        )
      )
    )
  );
```

#### Verification Tests:
```typescript
// Add to testing suite
describe('Data Isolation Verification', () => {
  test('Instrutor cannot access other congregation data', async () => {
    const instrutor1 = { id: 'user1', congregacao: 'Congregação A' };
    const instrutor2 = { id: 'user2', congregacao: 'Congregação B' };
    
    // Instrutor1 creates program
    const programa = await createPrograma(instrutor1.id);
    
    // Instrutor2 should not see it
    const { data } = await supabase
      .from('programas')
      .select('*')
      .eq('id', programa.id);
    
    expect(data).toHaveLength(0);
  });
});
```

#### Enhanced Isolation Measures:
```sql
-- Additional isolation for designacoes
CREATE POLICY "Instrutor designacoes congregation isolation"
  ON public.designacoes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      JOIN public.programas prog ON prog.id = designacoes.id_programa
      WHERE p.id = auth.uid() 
      AND p.role = 'instrutor'
      AND (
        prog.user_id = auth.uid()
        OR
        EXISTS (
          SELECT 1 FROM public.profiles p2
          WHERE p2.id = prog.user_id
          AND p2.congregacao = p.congregacao
        )
      )
    )
  );
```

### 6. Concurrent Editing Controls

**Recommendation: Optimistic Locking with Conflict Notification**

Based on our existing `revision` metadata from MCP-05.1:

#### Technical Implementation:
```typescript
// Enhanced concurrent editing support
interface ConcurrentEditingManager {
  checkForConflicts(recordId: string, currentRevision: number): Promise<boolean>;
  resolveConflict(conflictData: ConflictResolution): Promise<void>;
  notifyUsers(conflictInfo: ConflictNotification): Promise<void>;
}

// Add to DesignacoesOptimized.tsx
export async function saveAssignmentWithConflictCheck(
  assignmentData: any,
  expectedRevision: number
): Promise<{ success: boolean; conflict?: ConflictInfo }> {
  const { data, error } = await supabase
    .from('designacoes')
    .update({
      ...assignmentData,
      // Revision will be auto-incremented by trigger
    })
    .eq('id', assignmentData.id)
    .eq('revision', expectedRevision) // Optimistic lock check
    .select();

  if (error?.code === 'PGRST116') { // No rows updated = revision conflict
    return {
      success: false,
      conflict: await getConflictInfo(assignmentData.id)
    };
  }

  return { success: true };
}
```

#### Database Enhancement:
```sql
-- Add concurrent editing tracking
CREATE TABLE editing_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  resource_type TEXT NOT NULL, -- 'programa', 'designacao'
  resource_id UUID NOT NULL,
  started_at TIMESTAMPTZ DEFAULT now(),
  last_activity TIMESTAMPTZ DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Function to detect concurrent editing
CREATE OR REPLACE FUNCTION check_concurrent_editing(
  p_resource_type TEXT,
  p_resource_id UUID,
  p_user_id UUID
) RETURNS JSONB AS $$
DECLARE
  concurrent_users JSONB;
BEGIN
  SELECT jsonb_agg(
    jsonb_build_object(
      'user_id', es.user_id,
      'user_name', p.nome_completo,
      'started_at', es.started_at
    )
  ) INTO concurrent_users
  FROM editing_sessions es
  JOIN profiles p ON p.id = es.user_id
  WHERE es.resource_type = p_resource_type
    AND es.resource_id = p_resource_id
    AND es.user_id != p_user_id
    AND es.is_active = true
    AND es.last_activity > now() - interval '5 minutes';
  
  RETURN COALESCE(concurrent_users, '[]'::jsonb);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Conflict Resolution Strategies:

1. **Real-time Notifications**:
   ```typescript
   // WebSocket integration for live conflict detection
   useEffect(() => {
     const subscription = supabase
       .channel(`editing_${resourceId}`)
       .on('postgres_changes', {
         event: 'UPDATE',
         schema: 'public',
         table: 'designacoes',
         filter: `id=eq.${resourceId}`
       }, (payload) => {
         if (payload.new.revision > currentRevision) {
           showConflictNotification(payload);
         }
       })
       .subscribe();

     return () => subscription.unsubscribe();
   }, [resourceId, currentRevision]);
   ```

2. **Automatic Merge for Compatible Changes**:
   ```typescript
   function attemptAutoMerge(
     baseVersion: any,
     userChanges: any,
     otherChanges: any
   ): { success: boolean; merged?: any; conflicts?: string[] } {
     // Auto-merge if changes affect different fields
     const userFields = Object.keys(userChanges);
     const otherFields = Object.keys(otherChanges);
     const conflictFields = userFields.filter(f => otherFields.includes(f));
     
     if (conflictFields.length === 0) {
       return {
         success: true,
         merged: { ...baseVersion, ...userChanges, ...otherChanges }
       };
     }
     
     return {
       success: false,
       conflicts: conflictFields
     };
   }
   ```

3. **Manual Conflict Resolution UI**:
   ```typescript
   // ConflictResolutionModal component
   interface ConflictResolutionProps {
     conflicts: ConflictInfo[];
     onResolve: (resolution: ConflictResolution) => void;
   }
   
   const ConflictResolutionModal: React.FC<ConflictResolutionProps> = ({
     conflicts,
     onResolve
   }) => {
     // UI for choosing between conflicting versions
     // Side-by-side comparison
     // Option to merge manually
   };
   ```

### Integration with Existing Systems

#### MCP-02 (Offline System):
```typescript
// Enhanced offline conflict handling in offlineLocalDB.ts
export async function syncWithConflictResolution(): Promise<SyncResult> {
  const outboxItems = await getOutboxItems();
  const conflicts: ConflictInfo[] = [];
  
  for (const item of outboxItems) {
    const result = await syncItemWithConflictCheck(item);
    if (result.conflict) {
      conflicts.push(result.conflict);
    }
  }
  
  return {
    success: conflicts.length === 0,
    conflicts,
    synced: outboxItems.length - conflicts.length
  };
}
```

#### MCP-05 (RLS and Metadata):
- Leverages existing `revision` system for optimistic locking
- Integrates with `last_modified_by` for conflict attribution
- Uses existing RLS policies for access control

### Performance Considerations

1. **Session Cleanup**: Automatic cleanup of inactive editing sessions
2. **Conflict Detection**: Efficient queries using indexes on revision and timestamps
3. **Real-time Updates**: WebSocket subscriptions only for active editing sessions
4. **Batch Conflict Resolution**: Handle multiple conflicts in single transaction

### Security Considerations

1. **Access Validation**: All conflict resolution respects RLS policies
2. **Audit Trail**: All conflict resolutions logged with full context
3. **Data Integrity**: Atomic operations prevent partial updates during conflicts
4. **User Privacy**: Conflict notifications only show necessary information

This architecture ensures data integrity while providing a smooth user experience for concurrent editing scenarios common in congregation management.
