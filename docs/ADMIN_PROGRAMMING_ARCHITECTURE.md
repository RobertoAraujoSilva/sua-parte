# Admin Programming Architecture
## Global Programming Management Technical Specifications

### 1. Data Source Strategy

**Recommendation: Hybrid Approach with PDF Processing Pipeline**

Based on our current `workbookParser.ts` implementation and `workbook_versions` table schema, we recommend a hybrid approach:

#### Primary Data Flow:
```typescript
// Current implementation in src/utils/workbookParser.ts
export async function processWorkbook(
  content: string | File,
  metadata: Partial<WorkbookMetadata>,
  adminUserId: string
): Promise<WorkbookParsingResult>
```

**Technical Implementation:**
1. **PDF Processing**: Admin uploads official MWB PDFs → `workbookParser.ts` extracts content
2. **Structured Storage**: Parsed data stored in `global_programming` table with source traceability
3. **API Layer**: Internal API serves processed JSON to Instrutor dashboards

#### Database Schema Integration:
```sql
-- Current workbook_versions table supports this approach
CREATE TABLE workbook_versions (
  id UUID PRIMARY KEY,
  version_code TEXT NOT NULL, -- e.g., "mwb_E_202507"
  parsing_status TEXT CHECK (parsing_status IN ('pending', 'processing', 'completed', 'failed')),
  parsed_content JSONB, -- Structured programming data
  file_url TEXT, -- Original PDF reference
  -- ... existing fields
);
```

**Benefits:**
- Maintains official source fidelity
- Enables offline processing and validation
- Supports custom parsing rules for different languages/regions
- Provides audit trail through `workbook_versions` table

### 2. Update Automation Strategy

**Recommendation: Semi-Automated Import with Manual Validation**

#### Implementation Architecture:
```typescript
// Enhanced workbook processing workflow
interface AutoImportConfig {
  enabled: boolean;
  checkInterval: number; // hours
  autoPublish: boolean;
  requireManualReview: boolean;
}

// New function to add to workbookParser.ts
export async function scheduleWorkbookCheck(): Promise<void> {
  // Check for new workbooks every 24 hours
  // Parse automatically but require admin approval before publishing
}
```

#### Database Schema Enhancement:
```sql
-- Add to workbook_versions table
ALTER TABLE workbook_versions 
ADD COLUMN auto_imported BOOLEAN DEFAULT false,
ADD COLUMN requires_review BOOLEAN DEFAULT true,
ADD COLUMN review_status TEXT CHECK (review_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN reviewer_id UUID REFERENCES auth.users(id);
```

#### Integration with Current System:
- Extends existing `parsing_status` workflow
- Leverages current RLS policies (Admin-only access)
- Maintains compatibility with `global_programming` table structure

**Workflow:**
1. **Detection**: System monitors for new MWB releases (API or manual upload)
2. **Processing**: Automatic parsing using existing `workbookParser.ts`
3. **Review**: Admin validates parsed content before publishing
4. **Distribution**: Published content becomes available to Instrutors

### 3. Content Editability Strategy

**Recommendation: Controlled Editability with Source Tracking**

#### Technical Implementation:
```sql
-- Enhance global_programming table for editability
ALTER TABLE global_programming 
ADD COLUMN original_content JSONB, -- Immutable source content
ADD COLUMN custom_modifications JSONB, -- Admin edits
ADD COLUMN modification_reason TEXT,
ADD COLUMN is_modified BOOLEAN DEFAULT false;
```

#### Code Implementation:
```typescript
// Add to workbookParser.ts
interface ProgrammingModification {
  field: string;
  originalValue: any;
  modifiedValue: any;
  reason: string;
  modifiedBy: string;
  modifiedAt: string;
}

export async function modifyGlobalProgramming(
  partId: string,
  modifications: ProgrammingModification[],
  adminUserId: string
): Promise<{ success: boolean; error?: string }> {
  // Validate admin permissions
  // Store original content if first modification
  // Apply modifications to custom_modifications JSONB
  // Update is_modified flag
}
```

#### Integration Points:
- **PDF Generation**: `pdfGenerator.ts` uses modified content when available
- **RLS Policies**: Only Admin/Developer roles can modify
- **Audit Trail**: All modifications tracked with revision system
- **Instrutor View**: Shows modified content with indication of customization

#### Permitted Modifications:
1. **Timing Adjustments**: Modify `part_duration` for local needs
2. **Title Clarifications**: Enhance `part_title` for clarity
3. **Content References**: Update `content_references` for local materials
4. **Requirements**: Adjust `requirements` for congregation capabilities

#### Restrictions:
- Cannot delete official parts
- Cannot change fundamental structure (sections, part numbers)
- All modifications require justification and approval workflow

### Database Schema Summary

```sql
-- Complete enhanced schema for Admin programming management
CREATE TABLE global_programming (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Core programming data (from current implementation)
  week_start_date DATE NOT NULL,
  meeting_type TEXT NOT NULL CHECK (meeting_type IN ('midweek', 'weekend')),
  section_name TEXT NOT NULL,
  part_number INTEGER NOT NULL,
  part_title TEXT NOT NULL,
  part_duration INTEGER NOT NULL,
  part_type TEXT NOT NULL,
  
  -- Source tracking
  workbook_version_id UUID REFERENCES workbook_versions(id),
  source_material TEXT,
  
  -- Editability support
  original_content JSONB, -- Immutable source
  custom_modifications JSONB, -- Admin edits
  modification_reason TEXT,
  is_modified BOOLEAN DEFAULT false,
  
  -- Administrative control
  admin_user_id UUID REFERENCES auth.users(id),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  
  -- Sync metadata (from MCP-05.1)
  revision BIGINT NOT NULL DEFAULT 0,
  last_modified_by UUID REFERENCES auth.users(id),
  deleted_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### Integration with Existing Systems

#### MCP-01 (PDF Generation):
- `pdfGenerator.ts` enhanced to use modified content
- Maintains official JW formatting standards
- Includes modification indicators in admin PDFs

#### MCP-02 (Offline System):
- Global programming cached in IndexedDB for offline admin access
- Modification workflow supports offline editing with sync

#### MCP-05 (RLS):
- Enhanced policies support modification permissions
- Audit trail integration with existing revision system

### Security Considerations

1. **Access Control**: Only Admin/Developer roles can modify global programming
2. **Audit Trail**: All modifications logged with user, timestamp, and reason
3. **Source Integrity**: Original content preserved immutably
4. **Rollback Capability**: Modifications can be reverted to original state
5. **Approval Workflow**: Critical modifications require secondary approval

### Performance Considerations

1. **Caching**: Modified content cached for fast Instrutor access
2. **Indexing**: Indexes on `is_modified`, `status`, and `week_start_date`
3. **Batch Operations**: Support bulk modifications for efficiency
4. **Version Control**: Efficient storage of modifications using JSONB

This architecture provides the flexibility needed for local adaptations while maintaining the integrity and traceability of official JW programming materials.
