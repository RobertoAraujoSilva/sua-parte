/**
 * Family Inference Engine
 * 
 * This module provides intelligent inference of family relationships based on
 * data patterns, surnames, ages, and other contextual information.
 */

import type { 
  EstudanteEnhanced, 
  RelacaoFamiliar, 
  PapelFamiliar,
  EstadoCivil 
} from '@/types/enhanced-estudantes';

export interface FamilyInferenceResult {
  student1_id: string;
  student2_id: string;
  suggested_relationship: RelacaoFamiliar;
  confidence: 'high' | 'medium' | 'low';
  confidence_score: number; // 0-100
  reasoning: string[];
  evidence: {
    same_surname: boolean;
    age_compatible: boolean;
    gender_compatible: boolean;
    role_compatible: boolean;
    existing_family_structure: boolean;
  };
}

export interface FamilyGroup {
  surname: string;
  members: EstudanteEnhanced[];
  inferred_structure: {
    parents: EstudanteEnhanced[];
    children: EstudanteEnhanced[];
    adult_children: EstudanteEnhanced[];
    potential_couples: Array<{
      person1: EstudanteEnhanced;
      person2: EstudanteEnhanced;
      confidence: number;
    }>;
  };
  confidence_level: 'high' | 'medium' | 'low';
}

export interface InferenceStatistics {
  total_students: number;
  families_detected: number;
  relationships_inferred: number;
  high_confidence_relationships: number;
  medium_confidence_relationships: number;
  low_confidence_relationships: number;
  potential_issues: string[];
}

/**
 * Family Inference Engine Class
 */
export class FamilyInferenceEngine {
  
  /**
   * Analyzes a group of students and infers family relationships
   */
  static inferFamilyRelationships(students: EstudanteEnhanced[]): {
    relationships: FamilyInferenceResult[];
    families: FamilyGroup[];
    statistics: InferenceStatistics;
  } {
    console.log(`🔍 Starting family inference for ${students.length} students`);
    
    // Group students by surname
    const familyGroups = this.groupByFamily(students);
    
    // Analyze each family group
    const analyzedFamilies = familyGroups.map(group => this.analyzeFamilyGroup(group));
    
    // Extract relationship inferences
    const relationships: FamilyInferenceResult[] = [];
    analyzedFamilies.forEach(family => {
      relationships.push(...this.extractRelationshipsFromFamily(family));
    });
    
    // Generate statistics
    const statistics = this.generateInferenceStatistics(students, analyzedFamilies, relationships);
    
    console.log(`✅ Family inference completed: ${relationships.length} relationships inferred`);
    
    return {
      relationships: relationships.sort((a, b) => b.confidence_score - a.confidence_score),
      families: analyzedFamilies,
      statistics
    };
  }
  
  /**
   * Groups students by family surname
   */
  private static groupByFamily(students: EstudanteEnhanced[]): Array<{
    surname: string;
    members: EstudanteEnhanced[];
  }> {
    const familyMap = new Map<string, EstudanteEnhanced[]>();
    
    students.forEach(student => {
      // Extract surname from nome or use familia field
      const surname = student.familia || this.extractSurname(student.nome);
      
      if (surname && surname.length > 1) {
        if (!familyMap.has(surname)) {
          familyMap.set(surname, []);
        }
        familyMap.get(surname)!.push(student);
      }
    });
    
    // Only return families with 2+ members
    return Array.from(familyMap.entries())
      .filter(([_, members]) => members.length >= 2)
      .map(([surname, members]) => ({ surname, members }));
  }
  
  /**
   * Extracts surname from full name
   */
  private static extractSurname(nome: string): string {
    const parts = nome.trim().split(' ');
    return parts[parts.length - 1];
  }
  
  /**
   * Analyzes a family group to infer structure
   */
  private static analyzeFamilyGroup(group: { surname: string; members: EstudanteEnhanced[] }): FamilyGroup {
    const { surname, members } = group;
    
    // Sort members by age (oldest first)
    const sortedMembers = [...members].sort((a, b) => (b.idade || 0) - (a.idade || 0));
    
    // Categorize members
    const parents: EstudanteEnhanced[] = [];
    const children: EstudanteEnhanced[] = [];
    const adult_children: EstudanteEnhanced[] = [];
    
    sortedMembers.forEach(member => {
      if (member.idade >= 25) {
        // Potential parent
        parents.push(member);
      } else if (member.idade < 18) {
        // Child
        children.push(member);
      } else {
        // Adult child (18-24)
        adult_children.push(member);
      }
    });
    
    // Identify potential couples
    const potential_couples = this.identifyPotentialCouples(parents);
    
    // Determine confidence level
    const confidence_level = this.calculateFamilyConfidence(group, parents, children, potential_couples);
    
    return {
      surname,
      members,
      inferred_structure: {
        parents,
        children,
        adult_children,
        potential_couples
      },
      confidence_level
    };
  }
  
  /**
   * Identifies potential couples within a family group
   */
  private static identifyPotentialCouples(adults: EstudanteEnhanced[]): Array<{
    person1: EstudanteEnhanced;
    person2: EstudanteEnhanced;
    confidence: number;
  }> {
    const couples: Array<{
      person1: EstudanteEnhanced;
      person2: EstudanteEnhanced;
      confidence: number;
    }> = [];
    
    for (let i = 0; i < adults.length; i++) {
      for (let j = i + 1; j < adults.length; j++) {
        const person1 = adults[i];
        const person2 = adults[j];
        
        // Check if they could be a couple
        if (person1.genero !== person2.genero) {
          const ageDiff = Math.abs((person1.idade || 0) - (person2.idade || 0));
          let confidence = 0;
          
          // Age compatibility (closer ages = higher confidence)
          if (ageDiff <= 5) confidence += 40;
          else if (ageDiff <= 10) confidence += 25;
          else if (ageDiff <= 15) confidence += 10;
          
          // Both adults (25+)
          if ((person1.idade || 0) >= 25 && (person2.idade || 0) >= 25) {
            confidence += 30;
          }
          
          // Different genders
          confidence += 20;
          
          // Existing relationship indicators
          if (person1.estado_civil === 'casado' && person2.estado_civil === 'casado') {
            confidence += 10;
          }
          
          if (confidence >= 50) {
            couples.push({ person1, person2, confidence });
          }
        }
      }
    }
    
    return couples.sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Calculates confidence level for family group analysis
   */
  private static calculateFamilyConfidence(
    group: { surname: string; members: EstudanteEnhanced[] },
    parents: EstudanteEnhanced[],
    children: EstudanteEnhanced[],
    couples: Array<{ person1: EstudanteEnhanced; person2: EstudanteEnhanced; confidence: number }>
  ): 'high' | 'medium' | 'low' {
    let score = 0;
    
    // Family size factor
    if (group.members.length >= 3) score += 20;
    if (group.members.length >= 4) score += 10;
    
    // Clear generational structure
    if (parents.length > 0 && children.length > 0) score += 30;
    
    // Potential couple identified
    if (couples.length > 0 && couples[0].confidence >= 70) score += 25;
    
    // Age distribution makes sense
    const ages = group.members.map(m => m.idade || 0).sort((a, b) => b - a);
    if (ages.length >= 2) {
      const ageDiff = ages[0] - ages[ages.length - 1];
      if (ageDiff >= 15 && ageDiff <= 50) score += 15;
    }
    
    if (score >= 70) return 'high';
    if (score >= 40) return 'medium';
    return 'low';
  }
  
  /**
   * Extracts specific relationship inferences from analyzed family
   */
  private static extractRelationshipsFromFamily(family: FamilyGroup): FamilyInferenceResult[] {
    const relationships: FamilyInferenceResult[] = [];
    
    // Parent-child relationships
    family.inferred_structure.parents.forEach(parent => {
      [...family.inferred_structure.children, ...family.inferred_structure.adult_children].forEach(child => {
        const inference = this.inferParentChildRelationship(parent, child, family);
        if (inference) {
          relationships.push(inference);
        }
      });
    });
    
    // Spouse relationships
    family.inferred_structure.potential_couples.forEach(couple => {
      const inference = this.inferSpouseRelationship(couple.person1, couple.person2, family, couple.confidence);
      if (inference) {
        relationships.push(inference);
      }
    });
    
    // Sibling relationships (children with same parents)
    const allChildren = [...family.inferred_structure.children, ...family.inferred_structure.adult_children];
    for (let i = 0; i < allChildren.length; i++) {
      for (let j = i + 1; j < allChildren.length; j++) {
        // Siblings would be inferred through shared parents, not direct relationships
        // This is handled by the parent-child relationships above
      }
    }
    
    return relationships;
  }
  
  /**
   * Infers parent-child relationship
   */
  private static inferParentChildRelationship(
    parent: EstudanteEnhanced,
    child: EstudanteEnhanced,
    family: FamilyGroup
  ): FamilyInferenceResult | null {
    const reasoning: string[] = [];
    let confidence_score = 0;
    
    // Age difference check
    const ageDiff = (parent.idade || 0) - (child.idade || 0);
    if (ageDiff >= 15 && ageDiff <= 50) {
      confidence_score += 30;
      reasoning.push(`Diferença de idade apropriada (${ageDiff} anos)`);
    } else if (ageDiff < 15) {
      return null; // Too young to be parent
    }
    
    // Same surname
    if (family.surname) {
      confidence_score += 25;
      reasoning.push(`Mesmo sobrenome: ${family.surname}`);
    }
    
    // Parent age check
    if ((parent.idade || 0) >= 25) {
      confidence_score += 20;
      reasoning.push('Idade adequada para ser pai/mãe');
    }
    
    // Child age check
    if ((child.idade || 0) < 25) {
      confidence_score += 15;
      reasoning.push('Idade adequada para ser filho(a)');
    }
    
    // Family structure consistency
    if (family.confidence_level === 'high') {
      confidence_score += 10;
      reasoning.push('Estrutura familiar consistente');
    }
    
    if (confidence_score < 50) {
      return null;
    }
    
    const evidence = {
      same_surname: true,
      age_compatible: ageDiff >= 15 && ageDiff <= 50,
      gender_compatible: true, // Parent-child doesn't depend on gender compatibility
      role_compatible: (parent.idade || 0) >= 25 && (child.idade || 0) < 25,
      existing_family_structure: family.confidence_level !== 'low'
    };
    
    return {
      student1_id: child.id,
      student2_id: parent.id,
      suggested_relationship: 'filho_de',
      confidence: confidence_score >= 80 ? 'high' : confidence_score >= 65 ? 'medium' : 'low',
      confidence_score,
      reasoning,
      evidence
    };
  }
  
  /**
   * Infers spouse relationship
   */
  private static inferSpouseRelationship(
    person1: EstudanteEnhanced,
    person2: EstudanteEnhanced,
    family: FamilyGroup,
    coupleConfidence: number
  ): FamilyInferenceResult | null {
    const reasoning: string[] = [];
    let confidence_score = Math.floor(coupleConfidence * 0.8); // Base on couple detection confidence
    
    // Different genders
    if (person1.genero !== person2.genero) {
      confidence_score += 20;
      reasoning.push('Gêneros diferentes');
    } else {
      return null; // Same gender cannot be spouses
    }
    
    // Age compatibility
    const ageDiff = Math.abs((person1.idade || 0) - (person2.idade || 0));
    if (ageDiff <= 10) {
      confidence_score += 15;
      reasoning.push(`Idades compatíveis (diferença: ${ageDiff} anos)`);
    }
    
    // Both adults
    if ((person1.idade || 0) >= 18 && (person2.idade || 0) >= 18) {
      confidence_score += 10;
      reasoning.push('Ambos adultos');
    }
    
    // Marital status
    if (person1.estado_civil === 'casado' && person2.estado_civil === 'casado') {
      confidence_score += 15;
      reasoning.push('Ambos marcados como casados');
    }
    
    // Same surname
    if (family.surname) {
      confidence_score += 10;
      reasoning.push(`Mesmo sobrenome: ${family.surname}`);
    }
    
    if (confidence_score < 60) {
      return null;
    }
    
    const evidence = {
      same_surname: true,
      age_compatible: ageDiff <= 15,
      gender_compatible: person1.genero !== person2.genero,
      role_compatible: (person1.idade || 0) >= 18 && (person2.idade || 0) >= 18,
      existing_family_structure: family.confidence_level !== 'low'
    };
    
    return {
      student1_id: person1.id,
      student2_id: person2.id,
      suggested_relationship: 'conjuge',
      confidence: confidence_score >= 85 ? 'high' : confidence_score >= 70 ? 'medium' : 'low',
      confidence_score,
      reasoning,
      evidence
    };
  }
  
  /**
   * Generates inference statistics
   */
  private static generateInferenceStatistics(
    students: EstudanteEnhanced[],
    families: FamilyGroup[],
    relationships: FamilyInferenceResult[]
  ): InferenceStatistics {
    const potential_issues: string[] = [];
    
    // Check for potential issues
    const studentsInFamilies = new Set<string>();
    families.forEach(family => {
      family.members.forEach(member => studentsInFamilies.add(member.id));
    });
    
    const studentsWithoutFamily = students.length - studentsInFamilies.size;
    if (studentsWithoutFamily > 0) {
      potential_issues.push(`${studentsWithoutFamily} estudantes não foram agrupados em famílias`);
    }
    
    // Check for families without clear structure
    const unclearFamilies = families.filter(f => f.confidence_level === 'low').length;
    if (unclearFamilies > 0) {
      potential_issues.push(`${unclearFamilies} famílias com estrutura pouco clara`);
    }
    
    // Check for large age gaps in couples
    const problematicCouples = relationships.filter(r => 
      r.suggested_relationship === 'conjuge' && 
      r.evidence.age_compatible === false
    ).length;
    if (problematicCouples > 0) {
      potential_issues.push(`${problematicCouples} casais com diferenças de idade significativas`);
    }
    
    return {
      total_students: students.length,
      families_detected: families.length,
      relationships_inferred: relationships.length,
      high_confidence_relationships: relationships.filter(r => r.confidence === 'high').length,
      medium_confidence_relationships: relationships.filter(r => r.confidence === 'medium').length,
      low_confidence_relationships: relationships.filter(r => r.confidence === 'low').length,
      potential_issues
    };
  }
  
  /**
   * Validates inferred relationships against existing data
   */
  static validateInferences(
    relationships: FamilyInferenceResult[],
    existingStudents: EstudanteEnhanced[]
  ): {
    valid: FamilyInferenceResult[];
    conflicts: Array<{
      inference: FamilyInferenceResult;
      conflict_type: 'existing_relationship' | 'age_violation' | 'gender_violation' | 'logic_violation';
      description: string;
    }>;
  } {
    const valid: FamilyInferenceResult[] = [];
    const conflicts: Array<{
      inference: FamilyInferenceResult;
      conflict_type: 'existing_relationship' | 'age_violation' | 'gender_violation' | 'logic_violation';
      description: string;
    }> = [];
    
    const studentMap = new Map(existingStudents.map(s => [s.id, s]));
    
    relationships.forEach(inference => {
      const student1 = studentMap.get(inference.student1_id);
      const student2 = studentMap.get(inference.student2_id);
      
      if (!student1 || !student2) {
        conflicts.push({
          inference,
          conflict_type: 'logic_violation',
          description: 'Um ou ambos estudantes não encontrados'
        });
        return;
      }
      
      // Check for existing conflicting relationships
      if (inference.suggested_relationship === 'conjuge') {
        if (student1.id_conjuge && student1.id_conjuge !== student2.id) {
          conflicts.push({
            inference,
            conflict_type: 'existing_relationship',
            description: `${student1.nome} já tem cônjuge cadastrado`
          });
          return;
        }
        if (student2.id_conjuge && student2.id_conjuge !== student1.id) {
          conflicts.push({
            inference,
            conflict_type: 'existing_relationship',
            description: `${student2.nome} já tem cônjuge cadastrado`
          });
          return;
        }
      }
      
      if (inference.suggested_relationship === 'filho_de') {
        const child = student1;
        const parent = student2;
        
        if (parent.genero === 'masculino' && child.id_pai && child.id_pai !== parent.id) {
          conflicts.push({
            inference,
            conflict_type: 'existing_relationship',
            description: `${child.nome} já tem pai cadastrado`
          });
          return;
        }
        
        if (parent.genero === 'feminino' && child.id_mae && child.id_mae !== parent.id) {
          conflicts.push({
            inference,
            conflict_type: 'existing_relationship',
            description: `${child.nome} já tem mãe cadastrada`
          });
          return;
        }
      }
      
      // If no conflicts, add to valid list
      valid.push(inference);
    });
    
    return { valid, conflicts };
  }
  
  /**
   * Applies validated inferences to student data (dry run)
   */
  static applyInferences(
    students: EstudanteEnhanced[],
    inferences: FamilyInferenceResult[]
  ): {
    updated_students: EstudanteEnhanced[];
    changes_summary: {
      students_modified: number;
      relationships_added: number;
      changes_by_type: Record<RelacaoFamiliar, number>;
    };
  } {
    const updated_students = students.map(student => ({ ...student }));
    const studentMap = new Map(updated_students.map(s => [s.id, s]));
    
    let students_modified = 0;
    const changes_by_type: Record<RelacaoFamiliar, number> = {
      conjuge: 0,
      filho_de: 0,
      tutor_de: 0
    };
    
    inferences.forEach(inference => {
      if (inference.confidence === 'low') return; // Skip low confidence inferences
      
      const student1 = studentMap.get(inference.student1_id);
      const student2 = studentMap.get(inference.student2_id);
      
      if (!student1 || !student2) return;
      
      let modified = false;
      
      switch (inference.suggested_relationship) {
        case 'conjuge':
          if (!student1.id_conjuge) {
            student1.id_conjuge = student2.id;
            student1.estado_civil = 'casado';
            modified = true;
          }
          if (!student2.id_conjuge) {
            student2.id_conjuge = student1.id;
            student2.estado_civil = 'casado';
            modified = true;
          }
          break;
          
        case 'filho_de':
          const child = student1;
          const parent = student2;
          
          if (parent.genero === 'masculino' && !child.id_pai) {
            child.id_pai = parent.id;
            modified = true;
          } else if (parent.genero === 'feminino' && !child.id_mae) {
            child.id_mae = parent.id;
            modified = true;
          }
          
          // Set minor status and responsible parties
          if (child.idade < 18 && !child.responsavel_primario) {
            child.menor = true;
            child.responsavel_primario = parent.id;
            modified = true;
          }
          break;
      }
      
      if (modified) {
        students_modified++;
        changes_by_type[inference.suggested_relationship]++;
      }
    });
    
    return {
      updated_students,
      changes_summary: {
        students_modified,
        relationships_added: Object.values(changes_by_type).reduce((sum, count) => sum + count, 0),
        changes_by_type
      }
    };
  }
}