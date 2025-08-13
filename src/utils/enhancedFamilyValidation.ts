/**
 * Enhanced Family Validation Utilities
 * 
 * This module provides comprehensive validation for the enhanced family relationship system,
 * including S-38-T compliance checking and data integrity validation.
 */

import { supabase } from '@/integrations/supabase/client';
import type { 
  EstudanteEnhanced, 
  EstudanteWithFamily, 
  FamilyValidationResult,
  S38TComplianceCheck,
  EstadoCivil,
  PapelFamiliar,
  RelacaoFamiliar,
  Genero,
  Cargo
} from '@/types/enhanced-estudantes';

/**
 * Enhanced Family Validator Class
 */
export class EnhancedFamilyValidator {
  
  /**
   * Validates family relationships for S-38-T compliance
   */
  static async validateFamilyPairing(
    estudante1: EstudanteWithFamily,
    estudante2: EstudanteWithFamily
  ): Promise<FamilyValidationResult> {
    const warnings: string[] = [];
    const violations: string[] = [];
    const suggestions: string[] = [];
    
    // Rule 1: Same gender pairs are always allowed
    if (estudante1.genero === estudante2.genero) {
      return {
        is_valid: true,
        warnings,
        violations,
        suggestions,
        relationship_type: 'same_gender',
        confidence_level: 'high'
      };
    }
    
    // Rule 2: Minors with different genders cannot be paired
    if ((estudante1.menor || estudante2.menor) && estudante1.genero !== estudante2.genero) {
      violations.push('Menores de idade devem formar pares do mesmo gênero (S-38-T)');
      suggestions.push('Selecione um ajudante do mesmo gênero');
      
      return {
        is_valid: false,
        warnings,
        violations,
        suggestions,
        relationship_type: 'minor_mixed_gender',
        confidence_level: 'high'
      };
    }
    
    // Rule 3: Different gender pairs require family relationship
    const familyRelationship = await this.checkFamilyRelationship(estudante1, estudante2);
    
    if (familyRelationship.exists) {
      if (familyRelationship.type === 'direct') {
        return {
          is_valid: true,
          warnings,
          violations,
          suggestions,
          relationship_type: familyRelationship.relationship,
          confidence_level: 'high'
        };
      } else {
        warnings.push(`Relacionamento familiar detectado: ${familyRelationship.relationship}`);
        return {
          is_valid: true,
          warnings,
          violations,
          suggestions,
          relationship_type: familyRelationship.relationship,
          confidence_level: 'medium'
        };
      }
    }
    
    // No family relationship found for different gender pair
    violations.push('Pares de gêneros diferentes requerem relacionamento familiar (S-38-T)');
    suggestions.push('Selecione um ajudante do mesmo gênero ou familiar');
    
    return {
      is_valid: false,
      warnings,
      violations,
      suggestions,
      relationship_type: 'unrelated_mixed_gender',
      confidence_level: 'high'
    };
  }
  
  /**
   * Checks family relationship between two students
   */
  private static async checkFamilyRelationship(
    estudante1: EstudanteWithFamily,
    estudante2: EstudanteWithFamily
  ): Promise<{
    exists: boolean;
    type: 'direct' | 'indirect' | 'none';
    relationship?: string;
  }> {
    // Direct relationships
    if (estudante1.id_pai === estudante2.id || estudante1.id_mae === estudante2.id) {
      return { exists: true, type: 'direct', relationship: 'pai/mãe e filho(a)' };
    }
    
    if (estudante2.id_pai === estudante1.id || estudante2.id_mae === estudante1.id) {
      return { exists: true, type: 'direct', relationship: 'pai/mãe e filho(a)' };
    }
    
    if (estudante1.id_conjuge === estudante2.id || estudante2.id_conjuge === estudante1.id) {
      return { exists: true, type: 'direct', relationship: 'cônjuges' };
    }
    
    // Sibling relationships
    if (estudante1.id_pai && estudante2.id_pai && estudante1.id_pai === estudante2.id_pai) {
      return { exists: true, type: 'direct', relationship: 'irmãos (mesmo pai)' };
    }
    
    if (estudante1.id_mae && estudante2.id_mae && estudante1.id_mae === estudante2.id_mae) {
      return { exists: true, type: 'direct', relationship: 'irmãos (mesma mãe)' };
    }
    
    // Check family_links table for extended relationships
    try {
      const { data: links, error } = await (supabase as any)
        .from('family_links')
        .select('*')
        .or(`and(source_id.eq.${estudante1.id},target_id.eq.${estudante2.id}),and(source_id.eq.${estudante2.id},target_id.eq.${estudante1.id})`);
      
      if (error) {
        console.error('Error checking family links:', error);
        return { exists: false, type: 'none' };
      }
      
      if (links && links.length > 0) {
        const link = links[0];
        return { 
          exists: true, 
          type: 'indirect', 
          relationship: this.getRelationshipLabel(link.relacao as RelacaoFamiliar)
        };
      }
    } catch (error) {
      console.error('Exception checking family links:', error);
    }
    
    return { exists: false, type: 'none' };
  }
  
  /**
   * Validates student data integrity
   */
  static validateStudentData(estudante: EstudanteEnhanced): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    
    // Basic field validation
    if (!estudante.nome || estudante.nome.trim().length < 2) {
      errors.push('Nome deve ter pelo menos 2 caracteres');
    }
    
    if (!estudante.idade || estudante.idade < 1 || estudante.idade > 120) {
      errors.push('Idade deve estar entre 1 e 120 anos');
    }
    
    // Family relationship validation
    if (estudante.id_pai === estudante.id) {
      errors.push('Estudante não pode ser pai de si mesmo');
    }
    
    if (estudante.id_mae === estudante.id) {
      errors.push('Estudante não pode ser mãe de si mesmo');
    }
    
    if (estudante.id_conjuge === estudante.id) {
      errors.push('Estudante não pode ser cônjuge de si mesmo');
    }
    
    // Age-based validation
    if (estudante.menor === undefined) {
      if (estudante.idade < 18) {
        warnings.push('Campo "menor" não definido para estudante com menos de 18 anos');
      }
    } else if (estudante.menor && estudante.idade >= 18) {
      warnings.push('Estudante marcado como menor mas tem 18 anos ou mais');
    } else if (!estudante.menor && estudante.idade < 18) {
      warnings.push('Estudante não marcado como menor mas tem menos de 18 anos');
    }
    
    // Family role validation
    if (estudante.papel_familiar) {
      const roleAgeWarnings = this.validateFamilyRoleAge(estudante);
      warnings.push(...roleAgeWarnings);
    }
    
    // S-38-T qualification validation
    const s38tWarnings = this.validateS38TQualifications(estudante);
    warnings.push(...s38tWarnings);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }
  
  /**
   * Validates family role against age
   */
  private static validateFamilyRoleAge(estudante: EstudanteEnhanced): string[] {
    const warnings: string[] = [];
    
    if (!estudante.papel_familiar) return warnings;
    
    switch (estudante.papel_familiar) {
      case 'pai':
      case 'mae':
        if (estudante.idade < 18) {
          warnings.push(`Papel familiar "${estudante.papel_familiar}" inconsistente com idade ${estudante.idade}`);
        }
        break;
        
      case 'filho':
      case 'filha':
        if (estudante.idade >= 18) {
          warnings.push(`Considere alterar para "filho_adulto" ou "filha_adulta" para idade ${estudante.idade}`);
        }
        break;
        
      case 'filho_adulto':
      case 'filha_adulta':
        if (estudante.idade < 18) {
          warnings.push(`Papel familiar "${estudante.papel_familiar}" inconsistente com idade ${estudante.idade}`);
        }
        break;
    }
    
    return warnings;
  }
  
  /**
   * Validates S-38-T qualifications
   */
  private static validateS38TQualifications(estudante: EstudanteEnhanced): string[] {
    const warnings: string[] = [];
    
    // Bible reading - only males
    if (estudante.reading && estudante.genero === 'feminino') {
      warnings.push('Leitura da Bíblia é permitida apenas para homens (S-38-T)');
    }
    
    // Talks - only qualified males
    if (estudante.talk && estudante.genero === 'feminino') {
      warnings.push('Discursos são permitidos apenas para homens qualificados (S-38-T)');
    }
    
    if (estudante.talk && estudante.genero === 'masculino') {
      const qualifiedCargos: Cargo[] = ['anciao', 'servo_ministerial', 'publicador_batizado'];
      if (!qualifiedCargos.includes(estudante.cargo)) {
        warnings.push(`Discursos requerem cargo qualificado. Cargo atual: ${estudante.cargo}`);
      }
    }
    
    // Chairman and prayers - only qualified males
    if ((estudante.chairman || estudante.pray) && estudante.genero === 'feminino') {
      warnings.push('Presidir e orar são permitidos apenas para homens qualificados (S-38-T)');
    }
    
    return warnings;
  }
  
  /**
   * Generates comprehensive S-38-T compliance report
   */
  static async generateS38TComplianceReport(
    estudantes: EstudanteWithFamily[]
  ): Promise<S38TComplianceCheck[]> {
    const checks: S38TComplianceCheck[] = [];
    
    // Check 1: Bible reading qualifications
    const femaleReaders = estudantes.filter(e => e.reading && e.genero === 'feminino');
    if (femaleReaders.length > 0) {
      checks.push({
        rule_name: 'BIBLE_READING_MALE_ONLY',
        is_compliant: false,
        severity: 'error',
        message: 'Leitura da Bíblia deve ser realizada apenas por homens',
        affected_students: femaleReaders.map(e => e.id),
        suggested_alternatives: ['Remover qualificação de leitura para mulheres']
      });
    }
    
    // Check 2: Talk qualifications
    const unqualifiedSpeakers = estudantes.filter(e => 
      e.talk && (e.genero === 'feminino' || !['anciao', 'servo_ministerial', 'publicador_batizado'].includes(e.cargo))
    );
    if (unqualifiedSpeakers.length > 0) {
      checks.push({
        rule_name: 'TALKS_QUALIFIED_MALES',
        is_compliant: false,
        severity: 'error',
        message: 'Discursos devem ser dados apenas por homens qualificados',
        affected_students: unqualifiedSpeakers.map(e => e.id),
        suggested_alternatives: ['Ajustar qualificações ou cargos dos estudantes']
      });
    }
    
    // Check 3: Family relationship requirements for mixed-gender pairs
    // This would be checked during assignment generation
    
    return checks;
  }
  
  /**
   * Suggests family relationships based on surname and age patterns
   */
  static suggestFamilyRelationships(estudantes: EstudanteEnhanced[]): Array<{
    student1_id: string;
    student2_id: string;
    suggested_relationship: RelacaoFamiliar;
    confidence: 'high' | 'medium' | 'low';
    reason: string;
  }> {
    const suggestions: Array<{
      student1_id: string;
      student2_id: string;
      suggested_relationship: RelacaoFamiliar;
      confidence: 'high' | 'medium' | 'low';
      reason: string;
    }> = [];
    
    // Group by family name
    const familyGroups = new Map<string, EstudanteEnhanced[]>();
    estudantes.forEach(e => {
      if (e.familia) {
        if (!familyGroups.has(e.familia)) {
          familyGroups.set(e.familia, []);
        }
        familyGroups.get(e.familia)!.push(e);
      }
    });
    
    // Analyze each family group
    familyGroups.forEach((members, familyName) => {
      if (members.length < 2) return;
      
      // Find potential parents (adults 25+)
      const potentialParents = members.filter(m => m.idade >= 25);
      const children = members.filter(m => m.idade < 25);
      
      // Suggest parent-child relationships
      potentialParents.forEach(parent => {
        children.forEach(child => {
          if (parent.id !== child.id) {
            const relationship: RelacaoFamiliar = 'filho_de';
            const confidence = this.calculateRelationshipConfidence(parent, child, 'parent_child');
            
            suggestions.push({
              student1_id: child.id,
              student2_id: parent.id,
              suggested_relationship: relationship,
              confidence,
              reason: `Mesmo sobrenome "${familyName}", diferença de idade ${parent.idade - child.idade} anos`
            });
          }
        });
      });
      
      // Suggest spouse relationships (adults of different genders)
      const adults = members.filter(m => m.idade >= 18);
      for (let i = 0; i < adults.length; i++) {
        for (let j = i + 1; j < adults.length; j++) {
          const adult1 = adults[i];
          const adult2 = adults[j];
          
          if (adult1.genero !== adult2.genero && Math.abs(adult1.idade - adult2.idade) <= 15) {
            const confidence = this.calculateRelationshipConfidence(adult1, adult2, 'spouse');
            
            suggestions.push({
              student1_id: adult1.id,
              student2_id: adult2.id,
              suggested_relationship: 'conjuge',
              confidence,
              reason: `Mesmo sobrenome "${familyName}", idades compatíveis, gêneros diferentes`
            });
          }
        }
      }
    });
    
    return suggestions.sort((a, b) => {
      const confidenceOrder = { high: 3, medium: 2, low: 1 };
      return confidenceOrder[b.confidence] - confidenceOrder[a.confidence];
    });
  }
  
  /**
   * Calculates confidence level for relationship suggestion
   */
  private static calculateRelationshipConfidence(
    person1: EstudanteEnhanced,
    person2: EstudanteEnhanced,
    relationshipType: 'parent_child' | 'spouse' | 'sibling'
  ): 'high' | 'medium' | 'low' {
    let score = 0;
    
    // Same family name
    if (person1.familia === person2.familia) score += 3;
    
    switch (relationshipType) {
      case 'parent_child':
        const ageDiff = Math.abs(person1.idade - person2.idade);
        if (ageDiff >= 18 && ageDiff <= 50) score += 2;
        if (ageDiff >= 15 && ageDiff <= 60) score += 1;
        break;
        
      case 'spouse':
        const spouseAgeDiff = Math.abs(person1.idade - person2.idade);
        if (spouseAgeDiff <= 10) score += 2;
        if (spouseAgeDiff <= 15) score += 1;
        if (person1.genero !== person2.genero) score += 2;
        break;
        
      case 'sibling':
        const siblingAgeDiff = Math.abs(person1.idade - person2.idade);
        if (siblingAgeDiff <= 20) score += 2;
        if (siblingAgeDiff <= 30) score += 1;
        break;
    }
    
    if (score >= 5) return 'high';
    if (score >= 3) return 'medium';
    return 'low';
  }
  
  /**
   * Helper method to get relationship label
   */
  private static getRelationshipLabel(relacao: RelacaoFamiliar): string {
    const labels = {
      conjuge: 'cônjuges',
      filho_de: 'pai/mãe e filho(a)',
      tutor_de: 'responsável e dependente'
    };
    return labels[relacao];
  }
  
  /**
   * Validates entire family structure for consistency
   */
  static validateFamilyStructure(estudantes: EstudanteEnhanced[]): {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    // Check for circular relationships
    const circularRelationships = this.detectCircularRelationships(estudantes);
    errors.push(...circularRelationships);
    
    // Check for orphaned minors
    const orphanedMinors = estudantes.filter(e => 
      e.menor && !e.responsavel_primario && !e.id_pai && !e.id_mae
    );
    if (orphanedMinors.length > 0) {
      warnings.push(`${orphanedMinors.length} menor(es) sem responsável definido`);
      suggestions.push('Definir responsável para menores de idade');
    }
    
    // Check for inconsistent family roles
    const roleInconsistencies = this.detectRoleInconsistencies(estudantes);
    warnings.push(...roleInconsistencies);
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions
    };
  }
  
  /**
   * Detects circular relationships in family structure
   */
  private static detectCircularRelationships(estudantes: EstudanteEnhanced[]): string[] {
    const errors: string[] = [];
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    
    const dfs = (studentId: string, path: string[]): boolean => {
      if (recursionStack.has(studentId)) {
        errors.push(`Relacionamento circular detectado: ${path.join(' -> ')} -> ${studentId}`);
        return true;
      }
      
      if (visited.has(studentId)) {
        return false;
      }
      
      visited.add(studentId);
      recursionStack.add(studentId);
      
      const student = estudantes.find(e => e.id === studentId);
      if (student) {
        const relatives = [student.id_pai, student.id_mae, student.id_conjuge].filter(Boolean);
        for (const relativeId of relatives) {
          if (relativeId && dfs(relativeId, [...path, studentId])) {
            return true;
          }
        }
      }
      
      recursionStack.delete(studentId);
      return false;
    };
    
    estudantes.forEach(student => {
      if (!visited.has(student.id)) {
        dfs(student.id, []);
      }
    });
    
    return errors;
  }
  
  /**
   * Detects role inconsistencies in family structure
   */
  private static detectRoleInconsistencies(estudantes: EstudanteEnhanced[]): string[] {
    const warnings: string[] = [];
    
    estudantes.forEach(student => {
      // Check if parents have appropriate roles
      if (student.id_pai) {
        const pai = estudantes.find(e => e.id === student.id_pai);
        if (pai && pai.papel_familiar !== 'pai') {
          warnings.push(`${pai.nome} é pai de ${student.nome} mas não tem papel familiar "pai"`);
        }
      }
      
      if (student.id_mae) {
        const mae = estudantes.find(e => e.id === student.id_mae);
        if (mae && mae.papel_familiar !== 'mae') {
          warnings.push(`${mae.nome} é mãe de ${student.nome} mas não tem papel familiar "mae"`);
        }
      }
      
      // Check spouse consistency
      if (student.id_conjuge) {
        const conjuge = estudantes.find(e => e.id === student.id_conjuge);
        if (conjuge && conjuge.id_conjuge !== student.id) {
          warnings.push(`Relacionamento de cônjuge não é recíproco entre ${student.nome} e ${conjuge.nome}`);
        }
      }
    });
    
    return warnings;
  }
}