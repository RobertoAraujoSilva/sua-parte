# Student Management Architecture
## Student Data and Assignment System Technical Specifications

### 7. Student Data Scope Strategy

**Recommendation: Congregation-Isolated with Cross-Reference Support**

Based on our current `estudantes` table and RLS implementation, we recommend congregation-isolated student records with optional cross-referencing:

#### Current Implementation Analysis:
```sql
-- Current estudantes table structure
CREATE TABLE estudantes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome_completo TEXT NOT NULL,
  data_nascimento DATE,
  genero TEXT CHECK (genero IN ('masculino', 'feminino')),
  telefone TEXT,
  email TEXT,
  endereco TEXT,
  congregacao TEXT, -- Current congregation isolation field
  -- ... other fields
);
```

#### Enhanced Architecture:
```sql
-- Enhanced student management with cross-congregation support
ALTER TABLE estudantes 
ADD COLUMN primary_congregation TEXT NOT NULL DEFAULT 'default',
ADD COLUMN secondary_congregations TEXT[], -- For students attending multiple congregations
ADD COLUMN student_status TEXT DEFAULT 'active' CHECK (
  student_status IN ('active', 'inactive', 'moved', 'visiting')
),
ADD COLUMN cross_congregation_permissions JSONB DEFAULT '{}';

-- Cross-congregation reference table
CREATE TABLE student_congregation_access (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES estudantes(id) ON DELETE CASCADE,
  congregation_name TEXT NOT NULL,
  access_type TEXT CHECK (access_type IN ('primary', 'secondary', 'visiting')),
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMPTZ DEFAULT now(),
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  UNIQUE(student_id, congregation_name)
);
```

#### RLS Policy Enhancement:
```sql
-- Enhanced RLS for cross-congregation access
CREATE POLICY "Instrutor can access congregation students"
  ON public.estudantes FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() 
      AND p.role IN ('instrutor', 'admin')
      AND (
        -- Primary congregation access
        estudantes.primary_congregation = p.congregacao
        OR
        -- Secondary congregation access
        EXISTS (
          SELECT 1 FROM student_congregation_access sca
          WHERE sca.student_id = estudantes.id
          AND sca.congregation_name = p.congregacao
          AND sca.is_active = true
          AND (sca.expires_at IS NULL OR sca.expires_at > now())
        )
      )
    )
  );
```

#### Implementation in Code:
```typescript
// Add to student management system
interface StudentAccess {
  studentId: string;
  congregationName: string;
  accessType: 'primary' | 'secondary' | 'visiting';
  expiresAt?: Date;
}

export async function grantCrossCongregationAccess(
  access: StudentAccess,
  grantedBy: string
): Promise<{ success: boolean; error?: string }> {
  // Validate granting user has admin privileges
  // Check if student exists and is accessible
  // Create cross-congregation access record
  
  const { error } = await supabase
    .from('student_congregation_access')
    .insert({
      student_id: access.studentId,
      congregation_name: access.congregationName,
      access_type: access.accessType,
      granted_by: grantedBy,
      expires_at: access.expiresAt
    });

  return { success: !error, error: error?.message };
}
```

### 8. Assignment Logic Rules

**Recommendation: Rule-Based Assignment Engine with Override Capabilities**

Based on our existing assignment validation and the global programming requirements system:

#### Technical Implementation:
```typescript
// Assignment rule engine
interface AssignmentRule {
  id: string;
  name: string;
  type: 'restriction' | 'preference' | 'requirement';
  severity: 'error' | 'warning' | 'info';
  condition: (student: Student, assignment: Assignment, context: AssignmentContext) => boolean;
  message: string;
  overridable: boolean;
}

// Core assignment rules
const ASSIGNMENT_RULES: AssignmentRule[] = [
  {
    id: 'gender_restriction',
    name: 'Gender Restriction',
    type: 'restriction',
    severity: 'error',
    condition: (student, assignment) => {
      const requirements = assignment.global_part?.requirements;
      if (requirements?.gender_restriction === 'male') {
        return student.genero === 'masculino';
      }
      return true;
    },
    message: 'Esta parte requer participante masculino',
    overridable: false
  },
  {
    id: 'minimum_interval',
    name: 'Minimum Interval Between Same Assignment Types',
    type: 'preference',
    severity: 'warning',
    condition: (student, assignment, context) => {
      const lastSameType = context.recentAssignments
        .filter(a => a.tipo_parte === assignment.tipo_parte)
        .sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime())[0];
      
      if (!lastSameType) return true;
      
      const daysSince = Math.floor(
        (new Date(assignment.data).getTime() - new Date(lastSameType.data).getTime()) 
        / (1000 * 60 * 60 * 24)
      );
      
      return daysSince >= 30; // 30-day minimum interval
    },
    message: 'Estudante teve designação similar há menos de 30 dias',
    overridable: true
  },
  {
    id: 'experience_level',
    name: 'Experience Level Requirement',
    type: 'requirement',
    severity: 'warning',
    condition: (student, assignment) => {
      const requirements = assignment.global_part?.requirements;
      if (requirements?.experience_level === 'elder') {
        return student.cargo === 'anciao' || student.cargo === 'servo_ministerial';
      }
      return true;
    },
    message: 'Esta parte requer ancião ou servo ministerial',
    overridable: true
  }
];
```

#### Database Schema for Rules:
```sql
-- Assignment validation tracking
CREATE TABLE assignment_validations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  designacao_id UUID REFERENCES designacoes(id) ON DELETE CASCADE,
  rule_id TEXT NOT NULL,
  rule_type TEXT NOT NULL,
  severity TEXT NOT NULL,
  passed BOOLEAN NOT NULL,
  message TEXT,
  overridden BOOLEAN DEFAULT false,
  overridden_by UUID REFERENCES auth.users(id),
  overridden_at TIMESTAMPTZ,
  override_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);
```

#### Assignment Validation Engine:
```typescript
// Add to DesignacoesOptimized.tsx
export async function validateAssignment(
  studentId: string,
  assignmentData: any,
  context: AssignmentContext
): Promise<ValidationResult> {
  const student = await getStudentById(studentId);
  const assignment = await enrichAssignmentWithGlobalData(assignmentData);
  
  const validationResults: ValidationResult[] = [];
  
  for (const rule of ASSIGNMENT_RULES) {
    const passed = rule.condition(student, assignment, context);
    
    validationResults.push({
      ruleId: rule.id,
      ruleName: rule.name,
      type: rule.type,
      severity: rule.severity,
      passed,
      message: rule.message,
      overridable: rule.overridable
    });
    
    // Store validation result
    await supabase.from('assignment_validations').insert({
      designacao_id: assignment.id,
      rule_id: rule.id,
      rule_type: rule.type,
      severity: rule.severity,
      passed,
      message: rule.message
    });
  }
  
  return {
    valid: validationResults.every(r => r.passed || r.severity !== 'error'),
    errors: validationResults.filter(r => !r.passed && r.severity === 'error'),
    warnings: validationResults.filter(r => !r.passed && r.severity === 'warning'),
    info: validationResults.filter(r => !r.passed && r.severity === 'info')
  };
}
```

### 9. Assignment Override Capabilities

**Recommendation: Hierarchical Override System with Audit Trail**

#### Override Authority Levels:
```typescript
interface OverrideAuthority {
  role: string;
  canOverride: string[]; // Rule IDs that can be overridden
  requiresJustification: boolean;
  requiresSecondaryApproval: boolean;
}

const OVERRIDE_AUTHORITIES: OverrideAuthority[] = [
  {
    role: 'instrutor',
    canOverride: ['minimum_interval', 'experience_level'],
    requiresJustification: true,
    requiresSecondaryApproval: false
  },
  {
    role: 'admin',
    canOverride: ['minimum_interval', 'experience_level', 'gender_restriction'],
    requiresJustification: true,
    requiresSecondaryApproval: true // For critical overrides
  }
];
```

#### Override Implementation:
```typescript
export async function overrideAssignmentRule(
  designacaoId: string,
  ruleId: string,
  reason: string,
  overriddenBy: string
): Promise<{ success: boolean; error?: string; requiresApproval?: boolean }> {
  // Check user authority
  const userRole = await getUserRole(overriddenBy);
  const authority = OVERRIDE_AUTHORITIES.find(a => a.role === userRole);
  
  if (!authority?.canOverride.includes(ruleId)) {
    return { success: false, error: 'Insufficient privileges to override this rule' };
  }
  
  // For critical overrides, create approval request
  if (authority.requiresSecondaryApproval && ruleId === 'gender_restriction') {
    await createOverrideApprovalRequest(designacaoId, ruleId, reason, overriddenBy);
    return { success: true, requiresApproval: true };
  }
  
  // Apply override
  const { error } = await supabase
    .from('assignment_validations')
    .update({
      overridden: true,
      overridden_by: overriddenBy,
      overridden_at: new Date().toISOString(),
      override_reason: reason
    })
    .eq('designacao_id', designacaoId)
    .eq('rule_id', ruleId);
  
  return { success: !error, error: error?.message };
}
```

#### Integration with Existing Confirmation Workflow:
```typescript
// Enhanced confirmation workflow in existing system
export async function confirmAssignmentWithValidation(
  designacaoId: string,
  studentId: string
): Promise<ConfirmationResult> {
  // Run validation
  const validation = await validateAssignment(studentId, designacaoId, context);
  
  // If validation fails with errors, prevent confirmation
  if (validation.errors.length > 0) {
    return {
      success: false,
      error: 'Assignment has validation errors that must be resolved',
      validationResults: validation
    };
  }
  
  // If warnings exist, allow confirmation but log them
  if (validation.warnings.length > 0) {
    await logAssignmentWarnings(designacaoId, validation.warnings);
  }
  
  // Proceed with existing confirmation logic
  return await confirmAssignment(designacaoId, studentId);
}
```

### Integration with Existing Systems

#### MCP-02 (Offline System):
```typescript
// Enhanced offline validation in offlineLocalDB.ts
export async function validateAssignmentOffline(
  studentId: string,
  assignmentData: any
): Promise<ValidationResult> {
  // Use cached validation rules and student data
  const cachedRules = await getCachedValidationRules();
  const cachedStudent = await getCachedStudent(studentId);
  const recentAssignments = await getCachedRecentAssignments(studentId);
  
  // Run validation offline
  return runValidationRules(cachedStudent, assignmentData, {
    recentAssignments,
    rules: cachedRules
  });
}
```

#### MCP-05 (RLS and Metadata):
- All validation records respect congregation isolation
- Override audit trail integrates with existing revision system
- Cross-congregation access uses existing RLS framework

### Performance Considerations

1. **Rule Caching**: Validation rules cached for offline operation
2. **Batch Validation**: Multiple assignments validated in single operation
3. **Indexed Queries**: Indexes on student_id, congregation, and assignment dates
4. **Lazy Loading**: Validation context loaded only when needed

### Security Considerations

1. **Override Audit**: Complete audit trail for all rule overrides
2. **Role Validation**: Override authority checked at database level
3. **Data Isolation**: All validations respect congregation boundaries
4. **Approval Workflow**: Critical overrides require secondary approval

This architecture provides comprehensive assignment management while maintaining flexibility for congregation-specific needs and ensuring data integrity through robust validation and override systems.
