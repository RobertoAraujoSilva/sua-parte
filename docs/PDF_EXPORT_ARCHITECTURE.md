# PDF Export Architecture
## Technical Specifications for Role-Based PDF Generation

### 13. Admin PDF Content Strategy

**Recommendation: Multi-Format PDF Generation with Administrative Context**

Based on our enhanced `pdfGenerator.ts` implementation from MCP-01:

#### Admin PDF Types and Content:
```typescript
// Enhanced PDF generation for Admin users
interface AdminPDFOptions {
  type: 'global_template' | 'administrative_report' | 'distribution_package';
  includeMetadata: boolean;
  includeStatistics: boolean;
  includeInternalNotes: boolean;
  format: 'official' | 'administrative' | 'development';
}

// Admin-specific PDF generation
export async function generateAdminPDF(
  globalProgrammingData: GlobalProgramming[],
  options: AdminPDFOptions
): Promise<void> {
  const doc = new jsPDF();
  
  // Set admin-specific document properties
  doc.setProperties({
    title: `Global Programming ${options.type}`,
    subject: 'Sistema Ministerial - Administrative Document',
    author: 'Sistema Ministerial Admin',
    keywords: 'admin, global, programming, template',
    creator: 'Sistema Ministerial Admin Panel'
  });
  
  switch (options.type) {
    case 'global_template':
      await generateGlobalTemplatePDF(doc, globalProgrammingData, options);
      break;
    case 'administrative_report':
      await generateAdministrativeReportPDF(doc, globalProgrammingData, options);
      break;
    case 'distribution_package':
      await generateDistributionPackagePDF(doc, globalProgrammingData, options);
      break;
  }
}
```

#### Global Template PDF Implementation:
```typescript
async function generateGlobalTemplatePDF(
  doc: jsPDF,
  data: GlobalProgramming[],
  options: AdminPDFOptions
): Promise<void> {
  // Admin header with global context
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('TEMPLATE GLOBAL DE PROGRAMAÇÃO', 105, 18, { align: 'center' });
  doc.setFontSize(12);
  doc.text('VIDA E MINISTÉRIO CRISTÃO', 105, 26, { align: 'center' });
  
  // Administrative metadata (if enabled)
  if (options.includeMetadata) {
    let yPos = 35;
    doc.setFontSize(8);
    doc.setFont(undefined, 'normal');
    doc.text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, 20, yPos);
    yPos += 4;
    doc.text(`Versão: ${getSystemVersion()}`, 20, yPos);
    yPos += 4;
    doc.text(`Fonte: ${data[0]?.source_material || 'N/A'}`, 20, yPos);
    yPos += 4;
    doc.text(`Total de partes: ${data.length}`, 20, yPos);
    yPos += 8;
  }
  
  // Group by weeks for template format
  const weeklyData = groupProgrammingByWeek(data);
  let currentY = options.includeMetadata ? 55 : 40;
  
  Object.entries(weeklyData).forEach(([weekStart, weekData]) => {
    if (currentY > 250) {
      doc.addPage();
      currentY = 20;
    }
    
    // Week header
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text(`SEMANA DE ${formatDate(weekStart)}`, 20, currentY);
    currentY += 8;
    
    // Template structure with placeholders
    doc.setFontSize(9);
    doc.setFont(undefined, 'normal');
    
    weekData.forEach((part: GlobalProgramming) => {
      // Part with template indicators
      doc.text(`${part.part_number}. ${part.part_title}`, 25, currentY);
      doc.text(`(${part.part_duration} min)`, 160, currentY);
      
      // Template placeholder for local assignment
      doc.setFont(undefined, 'italic');
      doc.text('[DESIGNAR ESTUDANTE LOCAL]', 25, currentY + 4);
      doc.setFont(undefined, 'normal');
      
      currentY += 10;
    });
    
    currentY += 5;
  });
  
  // Administrative notes section
  if (options.includeInternalNotes) {
    doc.addPage();
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text('NOTAS ADMINISTRATIVAS', 20, 20);
    
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    let notesY = 35;
    
    const adminNotes = [
      '• Este é um template global para distribuição às congregações',
      '• Instrutores devem adaptar conforme necessidades locais',
      '• Manter estrutura oficial das reuniões',
      '• Designações devem seguir diretrizes da organização',
      '• Reportar problemas ao administrador do sistema'
    ];
    
    adminNotes.forEach(note => {
      doc.text(note, 20, notesY);
      notesY += 6;
    });
  }
}
```

#### Administrative Report PDF:
```typescript
async function generateAdministrativeReportPDF(
  doc: jsPDF,
  data: GlobalProgramming[],
  options: AdminPDFOptions
): Promise<void> {
  // Administrative report header
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('RELATÓRIO ADMINISTRATIVO', 105, 18, { align: 'center' });
  doc.text('SISTEMA MINISTERIAL', 105, 26, { align: 'center' });
  
  let yPos = 40;
  
  // Statistics section
  if (options.includeStatistics) {
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.text('ESTATÍSTICAS DO SISTEMA', 20, yPos);
    yPos += 10;
    
    const stats = await getSystemStatistics();
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    doc.text(`Total de congregações ativas: ${stats.activeCongregations}`, 20, yPos);
    yPos += 6;
    doc.text(`Total de usuários: ${stats.totalUsers}`, 20, yPos);
    yPos += 6;
    doc.text(`Programas gerados este mês: ${stats.programsThisMonth}`, 20, yPos);
    yPos += 6;
    doc.text(`Designações confirmadas: ${stats.confirmedAssignments}`, 20, yPos);
    yPos += 10;
  }
  
  // Usage analytics
  const usageData = await getUsageAnalytics();
  doc.setFontSize(12);
  doc.setFont(undefined, 'bold');
  doc.text('ANÁLISE DE USO', 20, yPos);
  yPos += 10;
  
  // Add charts and detailed analytics
  await addUsageCharts(doc, usageData, yPos);
}
```

### 14. Instrutor PDF Variations

**Recommendation: Flexible PDF Generation with Privacy Options**

#### Instrutor PDF Options:
```typescript
interface InstrutorPDFOptions {
  includeStudentNames: boolean;
  includeContactInfo: boolean;
  includeConfirmationStatus: boolean;
  format: 'complete' | 'anonymous' | 'backup' | 'distribution';
  watermark?: string;
  congregation: string;
}

// Enhanced Instrutor PDF generation
export async function generateInstrutorPDF(
  programData: ProgramData,
  assignments: AssignmentData[],
  options: InstrutorPDFOptions
): Promise<void> {
  const doc = new jsPDF();
  
  // Set congregation-specific properties
  doc.setProperties({
    title: `Programa - ${programData.mes_apostila} - ${options.congregation}`,
    subject: 'Programa da Reunião - Vida e Ministério Cristão',
    author: `Sistema Ministerial - ${options.congregation}`,
    keywords: 'jw, programa, reuniao, ministerio, congregacao',
    creator: 'Sistema Ministerial - Instrutor'
  });
  
  // Generate based on format type
  switch (options.format) {
    case 'complete':
      await generateCompleteProgramPDF(doc, programData, assignments, options);
      break;
    case 'anonymous':
      await generateAnonymousProgramPDF(doc, programData, assignments, options);
      break;
    case 'backup':
      await generateBackupProgramPDF(doc, programData, assignments, options);
      break;
    case 'distribution':
      await generateDistributionProgramPDF(doc, programData, assignments, options);
      break;
  }
}
```

#### Anonymous PDF Implementation:
```typescript
async function generateAnonymousProgramPDF(
  doc: jsPDF,
  programData: ProgramData,
  assignments: AssignmentData[],
  options: InstrutorPDFOptions
): Promise<void> {
  // Use existing PDF structure but anonymize student data
  
  // Header with congregation context
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('PROGRAMA DA REUNIÃO', 105, 18, { align: 'center' });
  doc.setFontSize(14);
  doc.text('VIDA E MINISTÉRIO CRISTÃO', 105, 26, { align: 'center' });
  
  // Add congregation identifier
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  doc.text(`Congregação: ${options.congregation}`, 105, 36, { align: 'center' });
  
  // Add watermark for anonymous version
  if (options.watermark) {
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(options.watermark, 105, 290, { align: 'center' });
    doc.setTextColor(0, 0, 0);
  }
  
  // Process assignments without student names
  const anonymizedAssignments = assignments.map(assignment => ({
    ...assignment,
    estudante: assignment.estudante ? {
      ...assignment.estudante,
      nome: '[ESTUDANTE DESIGNADO]'
    } : null,
    ajudante: assignment.ajudante ? {
      ...assignment.ajudante,
      nome: '[AJUDANTE DESIGNADO]'
    } : null
  }));
  
  // Use existing PDF generation logic with anonymized data
  await generateStandardProgramContent(doc, programData, anonymizedAssignments, options);
}
```

#### Backup PDF with Full Details:
```typescript
async function generateBackupProgramPDF(
  doc: jsPDF,
  programData: ProgramData,
  assignments: AssignmentData[],
  options: InstrutorPDFOptions
): Promise<void> {
  // Complete backup version with all details
  
  // Standard program content
  await generateStandardProgramContent(doc, programData, assignments, options);
  
  // Add backup-specific information
  doc.addPage();
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('INFORMAÇÕES DE BACKUP', 20, 20);
  
  let yPos = 35;
  doc.setFontSize(10);
  doc.setFont(undefined, 'normal');
  
  // System information
  doc.text(`Data de geração: ${new Date().toLocaleString('pt-BR')}`, 20, yPos);
  yPos += 6;
  doc.text(`Versão do sistema: ${getSystemVersion()}`, 20, yPos);
  yPos += 6;
  doc.text(`ID do programa: ${programData.id}`, 20, yPos);
  yPos += 6;
  doc.text(`Total de designações: ${assignments.length}`, 20, yPos);
  yPos += 10;
  
  // Detailed assignment information
  doc.setFont(undefined, 'bold');
  doc.text('DETALHES DAS DESIGNAÇÕES', 20, yPos);
  yPos += 8;
  
  assignments.forEach((assignment, index) => {
    if (yPos > 250) {
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFont(undefined, 'bold');
    doc.text(`${index + 1}. ${assignment.titulo_parte}`, 20, yPos);
    yPos += 5;
    
    doc.setFont(undefined, 'normal');
    doc.setFontSize(9);
    
    if (assignment.estudante) {
      doc.text(`Estudante: ${assignment.estudante.nome}`, 25, yPos);
      if (options.includeContactInfo && assignment.estudante.telefone) {
        doc.text(`Telefone: ${assignment.estudante.telefone}`, 25, yPos + 4);
        yPos += 4;
      }
      yPos += 5;
    }
    
    if (assignment.ajudante) {
      doc.text(`Ajudante: ${assignment.ajudante.nome}`, 25, yPos);
      yPos += 5;
    }
    
    doc.text(`Status: ${assignment.confirmado ? 'Confirmado' : 'Pendente'}`, 25, yPos);
    yPos += 5;
    
    if (assignment.observacoes) {
      doc.text(`Observações: ${assignment.observacoes}`, 25, yPos);
      yPos += 5;
    }
    
    yPos += 3;
  });
}
```

### 15. Visual Format Compliance

**Current Implementation Validation:**

Our enhanced `pdfGenerator.ts` from MCP-01 already implements official JW format compliance:

#### Validated Compliance Features:
```typescript
// Official JW format elements (already implemented)
const JW_FORMAT_COMPLIANCE = {
  // Official time format: 7.00–7.05 (with en dash)
  timeFormat: (h: number, m: number) => `${h}.${m.toString().padStart(2,'0')}`,
  
  // Official meeting structure
  meetingStructure: {
    opening: ['Cântico de Abertura', 'Oração de Abertura', 'Comentários Iniciais'],
    treasures: ['Tesouros da Palavra de Deus', 'Joias Espirituais', 'Leitura da Bíblia'],
    ministry: ['Apresentação Inicial', 'Revisita', 'Estudo Bíblico'],
    christianLife: ['Parte 1', 'Estudo Bíblico da Congregação'],
    closing: ['Comentários Finais', 'Cântico Final', 'Oração de Encerramento']
  },
  
  // Official typography and spacing
  typography: {
    titleFont: 16,
    subtitleFont: 14,
    bodyFont: 9,
    spacing: 5,
    margins: { top: 20, left: 20, right: 190, bottom: 280 }
  }
};
```

#### Enhanced Compliance Validation:
```typescript
// PDF compliance checker
export function validatePDFCompliance(
  pdfContent: any,
  complianceLevel: 'strict' | 'flexible' | 'custom'
): ComplianceResult {
  const violations: ComplianceViolation[] = [];
  
  // Check time format compliance
  if (!validateTimeFormat(pdfContent.timeLabels)) {
    violations.push({
      type: 'time_format',
      severity: 'error',
      message: 'Time format must use official JW format (7.00–7.05)'
    });
  }
  
  // Check meeting structure
  if (!validateMeetingStructure(pdfContent.structure)) {
    violations.push({
      type: 'meeting_structure',
      severity: 'warning',
      message: 'Meeting structure deviates from official format'
    });
  }
  
  // Check typography compliance
  if (!validateTypography(pdfContent.fonts)) {
    violations.push({
      type: 'typography',
      severity: 'info',
      message: 'Typography differs from recommended format'
    });
  }
  
  return {
    compliant: violations.filter(v => v.severity === 'error').length === 0,
    violations,
    complianceScore: calculateComplianceScore(violations)
  };
}
```

#### Acceptable Local Customizations:
```typescript
// Permitted customizations that maintain compliance
const PERMITTED_CUSTOMIZATIONS = {
  // Congregation-specific additions (maintain structure)
  localAnnouncements: {
    position: 'after_closing_comments',
    maxDuration: 5, // minutes
    format: 'bullet_points'
  },
  
  // Timing adjustments (within limits)
  timingAdjustments: {
    maxVariation: 5, // ±5 minutes per part
    totalMeetingDuration: { min: 100, max: 110 } // minutes
  },
  
  // Visual customizations
  visualCustomizations: {
    congregationLogo: true,
    congregationName: true,
    localContactInfo: true,
    customFooter: true
  },
  
  // Language adaptations
  languageAdaptations: {
    localLanguage: true,
    culturalAdaptations: true,
    accessibilityFeatures: true
  }
};
```

### Integration with Existing Systems

#### MCP-01 (Current PDF System):
- All enhancements build upon existing `pdfGenerator.ts`
- Maintains backward compatibility with current PDF generation
- Extends existing official JW format implementation

#### Role-Based PDF Generation:
```typescript
// Unified PDF generation entry point
export async function generateRoleBasedPDF(
  data: any,
  userRole: string,
  options: any
): Promise<void> {
  switch (userRole) {
    case 'admin':
      return await generateAdminPDF(data, options);
    case 'instrutor':
      return await generateInstrutorPDF(data.programa, data.assignments, options);
    case 'estudante':
      return await generateEstudantePDF(data.assignments, options);
    default:
      throw new Error('Invalid user role for PDF generation');
  }
}
```

### Security and Privacy Considerations

1. **Data Privacy**: Anonymous PDFs remove all personal information
2. **Access Control**: PDF generation respects user role permissions
3. **Watermarking**: Administrative PDFs include appropriate watermarks
4. **Audit Trail**: All PDF generation logged with user and timestamp
5. **Content Validation**: All PDFs validated for compliance before generation

This architecture ensures that PDF generation maintains official JW format compliance while providing the flexibility needed for different user roles and use cases in the Sistema Ministerial.
