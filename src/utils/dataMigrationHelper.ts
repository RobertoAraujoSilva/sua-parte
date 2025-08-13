/**
 * Data Migration Helper for Enhanced Family Relationships
 * 
 * This utility helps migrate existing data to the new enhanced family relationship schema
 * while maintaining data integrity and providing rollback capabilities.
 */

import { supabase } from '@/integrations/supabase/client';
import { enhancedSupabase } from '@/integrations/supabase/enhanced-client';
import type {
    EstudanteEnhanced,
    EstudanteEnhancedRow,
    FamilyLink,
    CreateFamilyLinkInput,
    EstadoCivil,
    PapelFamiliar,
    RelacaoFamiliar
} from '@/types/enhanced-estudantes';
import { EnhancedFamilyValidator } from './enhancedFamilyValidation';

export interface MigrationResult {
    success: boolean;
    message: string;
    details: {
        studentsProcessed: number;
        relationshipsCreated: number;
        errors: string[];
        warnings: string[];
    };
}

export interface MigrationOptions {
    dryRun: boolean;
    userId: string;
    preserveExistingData: boolean;
    autoInferRelationships: boolean;
    validateAfterMigration: boolean;
}

/**
 * Data Migration Helper Class
 */
export class DataMigrationHelper {

    /**
     * Migrates existing student data to enhanced schema
     */
    static async migrateStudentData(options: MigrationOptions): Promise<MigrationResult> {
        const result: MigrationResult = {
            success: false,
            message: '',
            details: {
                studentsProcessed: 0,
                relationshipsCreated: 0,
                errors: [],
                warnings: []
            }
        };

        try {
            console.log('🔄 Starting data migration...', { dryRun: options.dryRun });

            // Step 1: Load existing students
            const { data: existingStudents, error: loadError } = await supabase
                .from('estudantes')
                .select('*')
                .eq('user_id', options.userId);

            if (loadError) {
                result.details.errors.push(`Error loading students: ${loadError.message}`);
                return result;
            }

            if (!existingStudents || existingStudents.length === 0) {
                result.message = 'No students found to migrate';
                result.success = true;
                return result;
            }

            console.log(`📊 Found ${existingStudents.length} students to process`);

            // Step 2: Process each student
            const migrationPromises = existingStudents.map(student =>
                this.processStudentMigration(student, options)
            );

            const migrationResults = await Promise.allSettled(migrationPromises);

            // Step 3: Collect results
            let successCount = 0;
            let relationshipCount = 0;

            migrationResults.forEach((migrationResult, index) => {
                if (migrationResult.status === 'fulfilled') {
                    const studentResult = migrationResult.value;
                    if (studentResult.success) {
                        successCount++;
                        relationshipCount += studentResult.relationshipsCreated;
                    } else {
                        result.details.errors.push(`Student ${existingStudents[index].nome}: ${studentResult.error}`);
                    }
                    result.details.warnings.push(...studentResult.warnings);
                } else {
                    result.details.errors.push(`Student ${existingStudents[index].nome}: ${migrationResult.reason}`);
                }
            });

            result.details.studentsProcessed = successCount;
            result.details.relationshipsCreated = relationshipCount;

            // Step 4: Auto-infer additional relationships if requested
            if (options.autoInferRelationships && !options.dryRun) {
                const inferenceResult = await this.inferFamilyRelationships(options.userId);
                result.details.relationshipsCreated += inferenceResult.relationshipsCreated;
                result.details.warnings.push(...inferenceResult.warnings);
            }

            // Step 5: Validate after migration if requested
            if (options.validateAfterMigration) {
                const validationResult = await this.validateMigrationResult(options.userId);
                result.details.warnings.push(...validationResult.warnings);
                result.details.errors.push(...validationResult.errors);
            }

            result.success = result.details.errors.length === 0;
            result.message = options.dryRun
                ? `Dry run completed: ${successCount}/${existingStudents.length} students would be migrated`
                : `Migration completed: ${successCount}/${existingStudents.length} students migrated, ${relationshipCount} relationships created`;

            console.log('✅ Migration completed', result);
            return result;

        } catch (error) {
            console.error('❌ Migration failed:', error);
            result.details.errors.push(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return result;
        }
    }

    /**
     * Processes migration for a single student
     */
    private static async processStudentMigration(
        student: any,
        options: MigrationOptions
    ): Promise<{
        success: boolean;
        error?: string;
        warnings: string[];
        relationshipsCreated: number;
    }> {
        const warnings: string[] = [];
        let relationshipsCreated = 0;

        try {
            // Prepare enhanced student data
            const enhancedData: Partial<EstudanteEnhancedRow> = {};

            // Extract family name from nome if not present
            if (!student.familia && student.nome) {
                const nameParts = student.nome.trim().split(' ');
                enhancedData.familia = nameParts[nameParts.length - 1];
            }

            // Set menor field based on age
            if (student.menor === null || student.menor === undefined) {
                enhancedData.menor = student.idade < 18;
            }

            // Estimate birth date from age if not provided
            if (!student.data_nascimento && student.idade) {
                const currentYear = new Date().getFullYear();
                const estimatedBirthYear = currentYear - student.idade;
                enhancedData.data_nascimento = `${estimatedBirthYear}-06-15`;
            }

            // Set default estado_civil
            if (!student.estado_civil) {
                enhancedData.estado_civil = 'desconhecido' as EstadoCivil;
            }

            // Infer papel_familiar based on age and gender
            if (!student.papel_familiar) {
                enhancedData.papel_familiar = this.inferPapelFamiliar(student.idade, student.genero);
            }

            // Set coabitacao default
            if (student.coabitacao === null || student.coabitacao === undefined) {
                enhancedData.coabitacao = true;
            }

            // Migrate id_pai_mae to id_pai/id_mae based on gender
            if (student.id_pai_mae && !student.id_pai && !student.id_mae) {
                const { data: parent } = await supabase
                    .from('estudantes')
                    .select('genero')
                    .eq('id', student.id_pai_mae)
                    .single();

                if (parent) {
                    if (parent.genero === 'masculino') {
                        enhancedData.id_pai = student.id_pai_mae;
                    } else {
                        enhancedData.id_mae = student.id_pai_mae;
                    }
                }
            }

            // Set responsible parties for minors
            if (enhancedData.menor && !student.responsavel_primario) {
                enhancedData.responsavel_primario = enhancedData.id_pai || enhancedData.id_mae;
                if (enhancedData.id_pai && enhancedData.id_mae) {
                    enhancedData.responsavel_secundario = enhancedData.id_mae;
                }
            }

            // Update student record if not dry run
            if (!options.dryRun && Object.keys(enhancedData).length > 0) {
                const { error: updateError } = await supabase
                    .from('estudantes')
                    .update(enhancedData)
                    .eq('id', student.id);

                if (updateError) {
                    return {
                        success: false,
                        error: `Failed to update student: ${updateError.message}`,
                        warnings,
                        relationshipsCreated: 0
                    };
                }
            }

            // Create family links if relationships exist
            if (!options.dryRun) {
                const linkResults = await this.createFamilyLinks(student.id, enhancedData, options.userId);
                relationshipsCreated = linkResults.created;
                warnings.push(...linkResults.warnings);
            }

            return {
                success: true,
                warnings,
                relationshipsCreated
            };

        } catch (error) {
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error',
                warnings,
                relationshipsCreated: 0
            };
        }
    }

    /**
     * Infers papel_familiar based on age and gender
     */
    private static inferPapelFamiliar(idade: number, genero: string): PapelFamiliar {
        if (idade >= 25) {
            return genero === 'masculino' ? 'pai' : 'mae';
        } else if (idade < 18) {
            return genero === 'masculino' ? 'filho' : 'filha';
        } else {
            return genero === 'masculino' ? 'filho_adulto' : 'filha_adulta';
        }
    }

    /**
     * Creates family links based on student relationships
     */
    private static async createFamilyLinks(
        studentId: string,
        enhancedData: Partial<EstudanteEnhancedRow>,
        userId: string
    ): Promise<{ created: number; warnings: string[] }> {
        const warnings: string[] = [];
        let created = 0;

        const linksToCreate: CreateFamilyLinkInput[] = [];

        // Create parent-child links
        if (enhancedData.id_pai) {
            linksToCreate.push({
                user_id: userId,
                source_id: studentId,
                target_id: enhancedData.id_pai,
                relacao: 'filho_de'
            });
        }

        if (enhancedData.id_mae) {
            linksToCreate.push({
                user_id: userId,
                source_id: studentId,
                target_id: enhancedData.id_mae,
                relacao: 'filho_de'
            });
        }

        // Create spouse links
        if (enhancedData.id_conjuge) {
            linksToCreate.push({
                user_id: userId,
                source_id: studentId,
                target_id: enhancedData.id_conjuge,
                relacao: 'conjuge'
            });
        }

        // Create guardian links
        if (enhancedData.responsavel_primario && enhancedData.responsavel_primario !== studentId) {
            linksToCreate.push({
                user_id: userId,
                source_id: enhancedData.responsavel_primario,
                target_id: studentId,
                relacao: 'tutor_de'
            });
        }

        // Insert family links
        for (const link of linksToCreate) {
            try {
                const { error } = await enhancedSupabase
                    .from('family_links')
                    .insert(link);

                if (error) {
                    if (!error.message.includes('duplicate key')) {
                        warnings.push(`Failed to create family link: ${error.message}`);
                    }
                } else {
                    created++;
                }
            } catch (error) {
                warnings.push(`Exception creating family link: ${error instanceof Error ? error.message : 'Unknown error'}`);
            }
        }

        return { created, warnings };
    }

    /**
     * Infers additional family relationships based on patterns using the inference engine
     */
    private static async inferFamilyRelationships(userId: string): Promise<{
        relationshipsCreated: number;
        warnings: string[];
    }> {
        const warnings: string[] = [];
        let relationshipsCreated = 0;

        try {
            // Load all students for the user
            const { data: students, error } = await supabase
                .from('estudantes')
                .select('*')
                .eq('user_id', userId);

            if (error || !students) {
                warnings.push(`Failed to load students for relationship inference: ${error?.message}`);
                return { relationshipsCreated: 0, warnings };
            }

            // Use the advanced inference engine
            const { FamilyInferenceEngine } = await import('./familyInferenceEngine');
            const inferenceResult = FamilyInferenceEngine.inferFamilyRelationships(students as EstudanteEnhanced[]);

            console.log(`🔍 Inference engine results:`, inferenceResult.statistics);

            // Validate inferences against existing data
            const validation = FamilyInferenceEngine.validateInferences(
                inferenceResult.relationships,
                students as EstudanteEnhanced[]
            );

            if (validation.conflicts.length > 0) {
                warnings.push(`Found ${validation.conflicts.length} relationship conflicts`);
                validation.conflicts.forEach(conflict => {
                    warnings.push(`Conflict: ${conflict.description}`);
                });
            }

            // Create high and medium confidence relationships
            const relationshipsToCreate = validation.valid.filter(r =>
                r.confidence === 'high' || r.confidence === 'medium'
            );

            console.log(`📝 Creating ${relationshipsToCreate.length} inferred relationships`);

            for (const inference of relationshipsToCreate) {
                try {
                    const { error } = await enhancedSupabase
                        .from('family_links')
                        .insert({
                            user_id: userId,
                            source_id: inference.student1_id,
                            target_id: inference.student2_id,
                            relacao: inference.suggested_relationship
                        });

                    if (error) {
                        if (!error.message.includes('duplicate key')) {
                            warnings.push(`Failed to create inferred relationship: ${error.message}`);
                        }
                    } else {
                        relationshipsCreated++;
                    }
                } catch (error) {
                    warnings.push(`Exception creating inferred relationship: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }

            // Also update student records with inferred relationships
            const applyResult = FamilyInferenceEngine.applyInferences(
                students as EstudanteEnhanced[],
                relationshipsToCreate
            );

            console.log(`📊 Inference summary:`, applyResult.changes_summary);

            // Update student records with inferred family relationships
            for (const updatedStudent of applyResult.updated_students) {
                const originalStudent = students.find(s => s.id === updatedStudent.id);
                if (!originalStudent) continue;

                // Check if student was actually modified
                const hasChanges = (
                    updatedStudent.id_pai !== (originalStudent as any).id_pai ||
                    updatedStudent.id_mae !== (originalStudent as any).id_mae ||
                    updatedStudent.id_conjuge !== (originalStudent as any).id_conjuge ||
                    updatedStudent.estado_civil !== (originalStudent as any).estado_civil ||
                    updatedStudent.menor !== (originalStudent as any).menor ||
                    updatedStudent.responsavel_primario !== (originalStudent as any).responsavel_primario
                );

                if (hasChanges) {
                    try {
                        const updateData: any = {};

                        if (updatedStudent.id_pai !== (originalStudent as any).id_pai) {
                            updateData.id_pai = updatedStudent.id_pai;
                        }
                        if (updatedStudent.id_mae !== (originalStudent as any).id_mae) {
                            updateData.id_mae = updatedStudent.id_mae;
                        }
                        if (updatedStudent.id_conjuge !== (originalStudent as any).id_conjuge) {
                            updateData.id_conjuge = updatedStudent.id_conjuge;
                        }
                        if (updatedStudent.estado_civil !== (originalStudent as any).estado_civil) {
                            updateData.estado_civil = updatedStudent.estado_civil;
                        }
                        if (updatedStudent.menor !== (originalStudent as any).menor) {
                            updateData.menor = updatedStudent.menor;
                        }
                        if (updatedStudent.responsavel_primario !== (originalStudent as any).responsavel_primario) {
                            updateData.responsavel_primario = updatedStudent.responsavel_primario;
                        }

                        const { error: updateError } = await supabase
                            .from('estudantes')
                            .update(updateData)
                            .eq('id', updatedStudent.id);

                        if (updateError) {
                            warnings.push(`Failed to update student ${updatedStudent.nome}: ${updateError.message}`);
                        }
                    } catch (error) {
                        warnings.push(`Exception updating student ${updatedStudent.nome}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                    }
                }
            }

            console.log(`✅ Created ${relationshipsCreated} inferred relationships, updated ${applyResult.changes_summary.students_modified} students`);

            // Add inference statistics to warnings as informational messages
            warnings.push(`Inference completed: ${inferenceResult.statistics.families_detected} families detected`);
            warnings.push(`Relationships inferred: ${inferenceResult.statistics.high_confidence_relationships} high confidence, ${inferenceResult.statistics.medium_confidence_relationships} medium confidence`);

            if (inferenceResult.statistics.potential_issues.length > 0) {
                warnings.push('Potential issues detected:');
                inferenceResult.statistics.potential_issues.forEach(issue => {
                    warnings.push(`- ${issue}`);
                });
            }

        } catch (error) {
            warnings.push(`Exception during relationship inference: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        return { relationshipsCreated, warnings };
    }

    /**
     * Validates migration result
     */
    private static async validateMigrationResult(userId: string): Promise<{
        warnings: string[];
        errors: string[];
    }> {
        const warnings: string[] = [];
        const errors: string[] = [];

        try {
            // Load migrated students
            const { data: students, error } = await supabase
                .from('estudantes')
                .select('*')
                .eq('user_id', userId);

            if (error || !students) {
                errors.push(`Failed to load students for validation: ${error?.message}`);
                return { warnings, errors };
            }

            // Validate each student
            for (const student of students) {
                const validation = EnhancedFamilyValidator.validateStudentData(student as EstudanteEnhanced);
                warnings.push(...validation.warnings);
                errors.push(...validation.errors);
            }

            // Validate family structure
            const structureValidation = EnhancedFamilyValidator.validateFamilyStructure(students as EstudanteEnhanced[]);
            warnings.push(...structureValidation.warnings);
            errors.push(...structureValidation.errors);

            console.log(`✅ Validation completed: ${errors.length} errors, ${warnings.length} warnings`);

        } catch (error) {
            errors.push(`Exception during validation: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        return { warnings, errors };
    }

    /**
     * Rollback migration (emergency use only)
     */
    static async rollbackMigration(userId: string): Promise<MigrationResult> {
        const result: MigrationResult = {
            success: false,
            message: '',
            details: {
                studentsProcessed: 0,
                relationshipsCreated: 0,
                errors: [],
                warnings: []
            }
        };

        try {
            console.log('🔄 Starting migration rollback...');

            // Remove all family links
            const { error: linksError } = await enhancedSupabase
                .from('family_links')
                .delete()
                .eq('user_id', userId);

            if (linksError) {
                result.details.errors.push(`Failed to remove family links: ${linksError.message}`);
                return result;
            }

            // Reset enhanced fields to null
            const { error: resetError } = await supabase
                .from('estudantes')
                .update({
                    data_nascimento: null,
                    estado_civil: 'desconhecido',
                    papel_familiar: null,
                    id_pai: null,
                    id_mae: null,
                    id_conjuge: null,
                    coabitacao: true,
                    menor: null,
                    responsavel_primario: null,
                    responsavel_secundario: null
                } as any)
                .eq('user_id', userId);

            if (resetError) {
                result.details.errors.push(`Failed to reset student fields: ${resetError.message}`);
                return result;
            }

            result.success = true;
            result.message = 'Migration rollback completed successfully';

            console.log('✅ Rollback completed');
            return result;

        } catch (error) {
            console.error('❌ Rollback failed:', error);
            result.details.errors.push(`Rollback failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
            return result;
        }
    }

    /**
     * Gets migration status for a user
     */
    static async getMigrationStatus(userId: string): Promise<{
        isMigrated: boolean;
        studentsCount: number;
        enhancedStudentsCount: number;
        familyLinksCount: number;
        migrationProgress: number;
    }> {
        try {
            // Count total students
            const { count: totalStudents } = await supabase
                .from('estudantes')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            // Count students with enhanced fields
            const { count: enhancedStudents } = await supabase
                .from('estudantes')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId)
                .not('papel_familiar', 'is', null);

            // Count family links
            const { count: familyLinks } = await enhancedSupabase
                .from('family_links')
                .select('*', { count: 'exact', head: true })
                .eq('user_id', userId);

            const studentsCount = totalStudents || 0;
            const enhancedStudentsCount = enhancedStudents || 0;
            const familyLinksCount = familyLinks || 0;

            const migrationProgress = studentsCount > 0 ? (enhancedStudentsCount / studentsCount) * 100 : 0;
            const isMigrated = migrationProgress > 80; // Consider migrated if >80% of students have enhanced fields

            return {
                isMigrated,
                studentsCount,
                enhancedStudentsCount,
                familyLinksCount,
                migrationProgress
            };

        } catch (error) {
            console.error('Error getting migration status:', error);
            return {
                isMigrated: false,
                studentsCount: 0,
                enhancedStudentsCount: 0,
                familyLinksCount: 0,
                migrationProgress: 0
            };
        }
    }
}