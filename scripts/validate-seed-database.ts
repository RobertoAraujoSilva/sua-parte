import Database from 'better-sqlite3';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface ValidationResult {
  table: string;
  count: number;
  valid: boolean;
  errors: string[];
}

interface DatabaseValidation {
  valid: boolean;
  totalRecords: number;
  tables: ValidationResult[];
  errors: string[];
}

class SeedDatabaseValidator {
  private seedPath: string;

  constructor() {
    this.seedPath = path.join(__dirname, '../resources/seed/ministerial-seed.db');
  }

  async validateSeedDatabase(): Promise<DatabaseValidation> {
    try {
      console.log('🔍 Starting seed database validation...');
      
      // Check if seed database exists
      if (!await fs.pathExists(this.seedPath)) {
        throw new Error(`Seed database not found at: ${this.seedPath}`);
      }

      const db = new Database(this.seedPath, { readonly: true });
      
      const validation: DatabaseValidation = {
        valid: true,
        totalRecords: 0,
        tables: [],
        errors: []
      };

      // Validate each table
      const tables = [
        { name: 'profiles', minRecords: 1 },
        { name: 'estudantes', minRecords: 1 },
        { name: 'programas', minRecords: 1 },
        { name: 'designacoes', minRecords: 1 },
        { name: 'meetings', minRecords: 1 },
        { name: 'migrations', minRecords: 1 }
      ];

      for (const table of tables) {
        const result = await this.validateTable(db, table.name, table.minRecords);
        validation.tables.push(result);
        validation.totalRecords += result.count;
        
        if (!result.valid) {
          validation.valid = false;
          validation.errors.push(...result.errors);
        }
      }

      // Validate relationships
      const relationshipErrors = await this.validateRelationships(db);
      if (relationshipErrors.length > 0) {
        validation.valid = false;
        validation.errors.push(...relationshipErrors);
      }

      // Validate data integrity
      const integrityErrors = await this.validateDataIntegrity(db);
      if (integrityErrors.length > 0) {
        validation.valid = false;
        validation.errors.push(...integrityErrors);
      }

      db.close();

      // Print results
      this.printValidationResults(validation);

      return validation;
    } catch (error) {
      console.error('❌ Validation failed:', error);
      throw error;
    }
  }

  private async validateTable(db: Database.Database, tableName: string, minRecords: number): Promise<ValidationResult> {
    const result: ValidationResult = {
      table: tableName,
      count: 0,
      valid: true,
      errors: []
    };

    try {
      // Check if table exists
      const tableExists = db.prepare(`
        SELECT name FROM sqlite_master 
        WHERE type='table' AND name=?
      `).get(tableName);

      if (!tableExists) {
        result.valid = false;
        result.errors.push(`Table '${tableName}' does not exist`);
        return result;
      }

      // Count records
      const countResult = db.prepare(`SELECT COUNT(*) as count FROM ${tableName}`).get() as { count: number };
      result.count = countResult.count;

      // Check minimum records
      if (result.count < minRecords) {
        result.valid = false;
        result.errors.push(`Table '${tableName}' has ${result.count} records, expected at least ${minRecords}`);
      }

      console.log(`✅ Table '${tableName}': ${result.count} records`);
    } catch (error) {
      result.valid = false;
      result.errors.push(`Error validating table '${tableName}': ${error}`);
    }

    return result;
  }

  private async validateRelationships(db: Database.Database): Promise<string[]> {
    const errors: string[] = [];

    try {
      // Check designacoes -> programas relationship
      const orphanedAssignments = db.prepare(`
        SELECT COUNT(*) as count 
        FROM designacoes d 
        LEFT JOIN programas p ON d.programa_id = p.id 
        WHERE p.id IS NULL
      `).get() as { count: number };

      if (orphanedAssignments.count > 0) {
        errors.push(`Found ${orphanedAssignments.count} assignments without valid programs`);
      }

      // Check designacoes -> estudantes relationship
      const orphanedStudentAssignments = db.prepare(`
        SELECT COUNT(*) as count 
        FROM designacoes d 
        LEFT JOIN estudantes e ON d.estudante_id = e.id 
        WHERE e.id IS NULL
      `).get() as { count: number };

      if (orphanedStudentAssignments.count > 0) {
        errors.push(`Found ${orphanedStudentAssignments.count} assignments without valid students`);
      }

      // Check estudantes -> estudantes (parent) relationship
      const orphanedChildren = db.prepare(`
        SELECT COUNT(*) as count 
        FROM estudantes e1 
        LEFT JOIN estudantes e2 ON e1.id_pai_mae = e2.id 
        WHERE e1.id_pai_mae IS NOT NULL AND e2.id IS NULL
      `).get() as { count: number };

      if (orphanedChildren.count > 0) {
        errors.push(`Found ${orphanedChildren.count} students with invalid parent references`);
      }

      console.log('✅ Relationship validation completed');
    } catch (error) {
      errors.push(`Error validating relationships: ${error}`);
    }

    return errors;
  }

  private async validateDataIntegrity(db: Database.Database): Promise<string[]> {
    const errors: string[] = [];

    try {
      // Check for required fields in estudantes
      const studentsWithoutNames = db.prepare(`
        SELECT COUNT(*) as count 
        FROM estudantes 
        WHERE nome IS NULL OR nome = ''
      `).get() as { count: number };

      if (studentsWithoutNames.count > 0) {
        errors.push(`Found ${studentsWithoutNames.count} students without proper names`);
      }

      // Check for valid cargo values
      const invalidCargos = db.prepare(`
        SELECT COUNT(*) as count 
        FROM estudantes 
        WHERE cargo NOT IN ('anciao', 'servo_ministerial', 'pioneiro_regular', 'publicador_batizado', 'publicador_nao_batizado', 'estudante_novo')
      `).get() as { count: number };

      if (invalidCargos.count > 0) {
        errors.push(`Found ${invalidCargos.count} students with invalid cargo values`);
      }

      // Check for valid genero values
      const invalidGeneros = db.prepare(`
        SELECT COUNT(*) as count 
        FROM estudantes 
        WHERE genero NOT IN ('masculino', 'feminino')
      `).get() as { count: number };

      if (invalidGeneros.count > 0) {
        errors.push(`Found ${invalidGeneros.count} students with invalid genero values`);
      }

      // Check for valid program dates
      const invalidPrograms = db.prepare(`
        SELECT COUNT(*) as count 
        FROM programas 
        WHERE semana_inicio IS NULL OR semana_fim IS NULL OR semana_inicio > semana_fim
      `).get() as { count: number };

      if (invalidPrograms.count > 0) {
        errors.push(`Found ${invalidPrograms.count} programs with invalid dates`);
      }

      // Check for valid assignment parts
      const invalidAssignments = db.prepare(`
        SELECT COUNT(*) as count 
        FROM designacoes 
        WHERE parte IS NULL OR parte = ''
      `).get() as { count: number };

      if (invalidAssignments.count > 0) {
        errors.push(`Found ${invalidAssignments.count} assignments without valid parts`);
      }

      console.log('✅ Data integrity validation completed');
    } catch (error) {
      errors.push(`Error validating data integrity: ${error}`);
    }

    return errors;
  }

  private printValidationResults(validation: DatabaseValidation): void {
    console.log('\n📊 Validation Results:');
    console.log('='.repeat(50));
    
    if (validation.valid) {
      console.log('✅ Seed database is VALID');
    } else {
      console.log('❌ Seed database has ERRORS');
    }
    
    console.log(`📈 Total records: ${validation.totalRecords}`);
    console.log('\n📋 Table Summary:');
    
    for (const table of validation.tables) {
      const status = table.valid ? '✅' : '❌';
      console.log(`  ${status} ${table.table}: ${table.count} records`);
      
      if (table.errors.length > 0) {
        for (const error of table.errors) {
          console.log(`    ⚠️ ${error}`);
        }
      }
    }
    
    if (validation.errors.length > 0) {
      console.log('\n🚨 Validation Errors:');
      for (const error of validation.errors) {
        console.log(`  ❌ ${error}`);
      }
    }
    
    console.log('='.repeat(50));
  }
}

// Run the validation
const validator = new SeedDatabaseValidator();
validator.validateSeedDatabase()
  .then((result) => {
    if (result.valid) {
      console.log('🎉 Seed database validation completed successfully!');
      process.exit(0);
    } else {
      console.log('💥 Seed database validation failed!');
      process.exit(1);
    }
  })
  .catch((error) => {
    console.error('💥 Seed database validation failed:', error);
    process.exit(1);
  });

export { SeedDatabaseValidator };