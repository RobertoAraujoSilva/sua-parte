#!/usr/bin/env node

/**
 * Apply Sync Metadata Migration
 * Applies the sync metadata and triggers migration to add revision tracking
 */

const { createClient } = require('@supabase/supabase-js');
const { readFileSync } = require('fs');
const { join } = require('path');

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://rttarliasydfffldayui.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseServiceKey) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function applyMigration() {
  try {
    console.log('🚀 Starting sync metadata migration...');
    
    // Read the migration file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20250822000000_add_sync_metadata_and_triggers.sql');
    const migrationSQL = readFileSync(migrationPath, 'utf8');
    
    console.log('📄 Migration file loaded successfully');
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.toLowerCase().includes('select ') && statement.includes('status')) {
        // Skip the final status message
        continue;
      }
      
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { 
          sql: statement + ';'
        });
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error);
          throw error;
        }
        
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (statementError) {
        console.error(`❌ Failed to execute statement ${i + 1}:`, statementError);
        console.log('Statement:', statement);
        throw statementError;
      }
    }
    
    console.log('🎉 Migration completed successfully!');
    
    // Verify the migration by checking if the new columns exist
    console.log('🔍 Verifying migration...');
    
    const tables = ['estudantes', 'programas', 'designacoes'];
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('revision, last_modified_by, deleted_at')
        .limit(1);
      
      if (error) {
        console.error(`❌ Verification failed for table ${table}:`, error);
      } else {
        console.log(`✅ Table ${table} has sync metadata columns`);
      }
    }
    
    console.log('✨ Migration verification completed!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
applyMigration();
