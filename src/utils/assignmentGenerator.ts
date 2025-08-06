/**
 * Assignment Generator with Family Relationship Validation
 * 
 * This module handles the generation of Theocratic Ministry School assignments
 * while respecting family relationships and S-38-T guidelines.
 */

import { supabase } from '@/integrations/supabase/client';
import { canBePaired, getFamilyRelationship } from '@/types/family';

export interface Student {
  id: string;
  nome_completo: string;
  gender: 'M' | 'F';
  age?: number;
  cargo: string;
  ativo: boolean;
  email?: string;
}

export interface AssignmentPart {
  part_number: number;
  part_title: string;
  assignment_type: 'bible_reading' | 'initial_call' | 'return_visit' | 'bible_study' | 'talk' | 'demonstration';
  duration_minutes: number;
  requires_assistant: boolean;
  gender_restriction?: 'M' | 'F';
}

export interface GeneratedAssignment {
  student_id: string;
  assistant_id?: string;
  part_number: number;
  part_title: string;
  assignment_type: string;
  theme: string;
  duration_minutes: number;
  meeting_date: string;
  status: 'scheduled';
}

export interface AssignmentGenerationOptions {
  meeting_date: string;
  parts: AssignmentPart[];
  theme: string;
  exclude_student_ids?: string[];
  prefer_family_pairs?: boolean;
}

/**
 * S-38-T Assignment Rules Implementation
 */
export class AssignmentRules {
  /**
   * Check if a student can be assigned to a specific part based on S-38-T guidelines
   */
  static canStudentTakePart(student: Student, part: AssignmentPart): boolean {
    // Part 3 (Bible Reading) - Men only
    if (part.part_number === 3 && part.assignment_type === 'bible_reading') {
      return student.gender === 'M';
    }

    // Parts 4-7 - Both genders, but talks only for qualified men
    if (part.part_number >= 4 && part.part_number <= 7) {
      if (part.assignment_type === 'talk') {
        // Talks require qualified men (Ancião, Servo Ministerial, or experienced publishers)
        return student.gender === 'M' && 
               ['anciao', 'servo_ministerial', 'pioneiro_regular', 'publicador_batizado'].includes(student.cargo);
      }
      
      // Demonstrations and other assignments can be done by both genders
      return true;
    }

    return true;
  }

  /**
   * Check if a student is qualified to give talks
   */
  static canGiveTalks(student: Student): boolean {
    return student.gender === 'M' && 
           ['anciao', 'servo_ministerial', 'pioneiro_regular', 'publicador_batizado'].includes(student.cargo);
  }

  /**
   * Check if a student needs an assistant for their assignment
   */
  static needsAssistant(student: Student, part: AssignmentPart): boolean {
    // Bible reading doesn't need assistant
    if (part.assignment_type === 'bible_reading') {
      return false;
    }

    // Talks don't need assistants
    if (part.assignment_type === 'talk') {
      return false;
    }

    // Demonstrations and field service presentations need assistants
    return ['demonstration', 'initial_call', 'return_visit', 'bible_study'].includes(part.assignment_type);
  }
}

/**
 * Main Assignment Generator Class
 */
export class AssignmentGenerator {
  private students: Student[] = [];
  private recentAssignments: Map<string, Date[]> = new Map();

  constructor(students: Student[]) {
    this.students = students.filter(s => s.ativo);
  }

  /**
   * Load recent assignments to avoid over-assigning students
   */
  async loadRecentAssignments(weeksBack: number = 8): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - (weeksBack * 7));

    try {
      const { data: assignments, error } = await supabase
        .from('assignments')
        .select('student_id, assistant_id, meeting_date')
        .gte('meeting_date', cutoffDate.toISOString().split('T')[0])
        .order('meeting_date', { ascending: false });

      if (error) {
        console.error('Error loading recent assignments:', error);
        return;
      }

      // Build map of recent assignments
      this.recentAssignments.clear();
      
      assignments?.forEach(assignment => {
        const date = new Date(assignment.meeting_date);
        
        // Track student assignments
        if (!this.recentAssignments.has(assignment.student_id)) {
          this.recentAssignments.set(assignment.student_id, []);
        }
        this.recentAssignments.get(assignment.student_id)!.push(date);
        
        // Track assistant assignments
        if (assignment.assistant_id) {
          if (!this.recentAssignments.has(assignment.assistant_id)) {
            this.recentAssignments.set(assignment.assistant_id, []);
          }
          this.recentAssignments.get(assignment.assistant_id)!.push(date);
        }
      });
    } catch (error) {
      console.error('Exception loading recent assignments:', error);
    }
  }

  /**
   * Get assignment frequency score (lower is better)
   */
  private getAssignmentFrequency(studentId: string): number {
    const assignments = this.recentAssignments.get(studentId) || [];
    return assignments.length;
  }

  /**
   * Find the best student for a specific part
   */
  private async findBestStudentForPart(
    part: AssignmentPart, 
    excludeIds: string[] = []
  ): Promise<Student | null> {
    // Filter eligible students
    const eligibleStudents = this.students.filter(student => 
      !excludeIds.includes(student.id) &&
      AssignmentRules.canStudentTakePart(student, part)
    );

    if (eligibleStudents.length === 0) {
      return null;
    }

    // Sort by assignment frequency (prefer less frequently assigned students)
    eligibleStudents.sort((a, b) => {
      const freqA = this.getAssignmentFrequency(a.id);
      const freqB = this.getAssignmentFrequency(b.id);
      return freqA - freqB;
    });

    return eligibleStudents[0];
  }

  /**
   * Find the best assistant for a student
   */
  private async findBestAssistant(
    student: Student, 
    part: AssignmentPart,
    excludeIds: string[] = []
  ): Promise<Student | null> {
    // Filter potential assistants
    const potentialAssistants = this.students.filter(assistant => 
      assistant.id !== student.id &&
      !excludeIds.includes(assistant.id)
    );

    if (potentialAssistants.length === 0) {
      return null;
    }

    // Check family relationships and pairing rules
    const validAssistants: Array<{ student: Student; isFamilyMember: boolean; frequency: number }> = [];

    for (const assistant of potentialAssistants) {
      // Check if they can be paired according to S-38-T guidelines
      const canPair = await canBePaired(
        { id: student.id, gender: student.gender, age: student.age },
        { id: assistant.id, gender: assistant.gender, age: assistant.age }
      );

      if (canPair) {
        const isFamilyMember = student.gender !== assistant.gender ? 
          await getFamilyRelationship(student.id, assistant.id) !== null : false;
        
        validAssistants.push({
          student: assistant,
          isFamilyMember,
          frequency: this.getAssignmentFrequency(assistant.id)
        });
      }
    }

    if (validAssistants.length === 0) {
      return null;
    }

    // Sort by preference: family members first, then by frequency
    validAssistants.sort((a, b) => {
      // Prefer family members for mixed-gender pairs
      if (student.gender !== a.student.gender && student.gender !== b.student.gender) {
        if (a.isFamilyMember && !b.isFamilyMember) return -1;
        if (!a.isFamilyMember && b.isFamilyMember) return 1;
      }
      
      // Then sort by assignment frequency
      return a.frequency - b.frequency;
    });

    return validAssistants[0].student;
  }

  /**
   * Generate assignments for a meeting
   */
  async generateAssignments(options: AssignmentGenerationOptions): Promise<GeneratedAssignment[]> {
    console.log('🎯 Generating assignments for:', options.meeting_date);
    
    await this.loadRecentAssignments();
    
    const assignments: GeneratedAssignment[] = [];
    const usedStudentIds = new Set<string>(options.exclude_student_ids || []);

    for (const part of options.parts) {
      console.log(`📝 Processing part ${part.part_number}: ${part.part_title}`);
      
      // Find student for this part
      const student = await this.findBestStudentForPart(part, Array.from(usedStudentIds));
      
      if (!student) {
        console.warn(`⚠️ No eligible student found for part ${part.part_number}`);
        continue;
      }

      usedStudentIds.add(student.id);
      
      // Create base assignment
      const assignment: GeneratedAssignment = {
        student_id: student.id,
        part_number: part.part_number,
        part_title: part.part_title,
        assignment_type: part.assignment_type,
        theme: options.theme,
        duration_minutes: part.duration_minutes,
        meeting_date: options.meeting_date,
        status: 'scheduled'
      };

      // Find assistant if needed
      if (AssignmentRules.needsAssistant(student, part)) {
        const assistant = await this.findBestAssistant(student, part, Array.from(usedStudentIds));
        
        if (assistant) {
          assignment.assistant_id = assistant.id;
          usedStudentIds.add(assistant.id);
          console.log(`👥 Paired ${student.nome_completo} with ${assistant.nome_completo}`);
          
          // Log family relationship if applicable
          const relationship = await getFamilyRelationship(student.id, assistant.id);
          if (relationship) {
            console.log(`👨‍👩‍👧‍👦 Family relationship: ${relationship}`);
          }
        } else {
          console.warn(`⚠️ No suitable assistant found for ${student.nome_completo}`);
        }
      }

      assignments.push(assignment);
      console.log(`✅ Assigned part ${part.part_number} to ${student.nome_completo}`);
    }

    console.log(`🎉 Generated ${assignments.length} assignments`);
    return assignments;
  }

  /**
   * Validate generated assignments against S-38-T rules
   */
  async validateAssignments(assignments: GeneratedAssignment[]): Promise<string[]> {
    const errors: string[] = [];

    for (const assignment of assignments) {
      const student = this.students.find(s => s.id === assignment.student_id);
      const assistant = assignment.assistant_id ? 
        this.students.find(s => s.id === assignment.assistant_id) : null;

      if (!student) {
        errors.push(`Student not found for assignment ${assignment.part_number}`);
        continue;
      }

      // Validate part assignment rules
      const part: AssignmentPart = {
        part_number: assignment.part_number,
        part_title: assignment.part_title,
        assignment_type: assignment.assignment_type as any,
        duration_minutes: assignment.duration_minutes,
        requires_assistant: !!assignment.assistant_id
      };

      if (!AssignmentRules.canStudentTakePart(student, part)) {
        errors.push(`${student.nome_completo} cannot take part ${assignment.part_number} (${assignment.assignment_type})`);
      }

      // Validate assistant pairing if applicable
      if (assistant) {
        const canPair = await canBePaired(
          { id: student.id, gender: student.gender, age: student.age },
          { id: assistant.id, gender: assistant.gender, age: assistant.age }
        );

        if (!canPair) {
          errors.push(`${student.nome_completo} and ${assistant.nome_completo} cannot be paired (S-38-T guidelines)`);
        }
      }
    }

    return errors;
  }
}

/**
 * Utility function to create assignment generator with current students
 */
export const createAssignmentGenerator = async (): Promise<AssignmentGenerator> => {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'estudante')
      .order('nome_completo');

    if (error) {
      console.error('Error loading students for assignment generator:', error);
      return new AssignmentGenerator([]);
    }

    const students: Student[] = (profiles || []).map(profile => ({
      id: profile.id,
      nome_completo: profile.nome_completo || '',
      gender: profile.cargo?.includes('feminino') ? 'F' : 'M', // This would need proper gender field
      cargo: profile.cargo || '',
      ativo: true, // Assuming active if in profiles
      email: profile.email || undefined,
    }));

    return new AssignmentGenerator(students);
  } catch (error) {
    console.error('Exception creating assignment generator:', error);
    return new AssignmentGenerator([]);
  }
};
