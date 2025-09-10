#!/usr/bin/env node

/**
 * Script to apply RLS and Storage fixes
 * This script applies the necessary migrations to fix RLS issues and storage configuration
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Migration files to apply (only the policy files, not bucket creation)
const migrationFiles = [
  'supabase/migrations/20250910133000_fix_assignment_history_rls.sql',
  'supabase/migrations/20250910193000_fix_assignment_history_insert_policies.sql',
  'supabase/migrations/20250910133500_fix_designacoes_rls_and_storage.sql',
  'supabase/migrations/20250910200000_fix_storage_policies_only.sql'
];

async function applyMigration(filePath) {
  try {
    console.log(`🔍 Applying migration: ${filePath}`);
    
    // Read the migration file
    const migrationPath = path.join(process.cwd(), filePath);
    if (!fs.existsSync(migrationPath)) {
      console.error(`❌ Migration file not found: ${migrationPath}`);
      return false;
    }
    
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    // Split migration into individual statements
    const statements = migrationSql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    // Execute each statement
    for (const statement of statements) {
      // Skip comments and empty statements
      if (statement.startsWith('--') || statement.length === 0) {
        continue;
      }
      
      // Skip DO blocks for now (these are PL/pgSQL blocks)
      if (statement.toUpperCase().startsWith('DO $$') || statement.toUpperCase().startsWith('DO $')) {
        console.log('⏭️  Skipping DO block (PL/pgSQL)');
        continue;
      }
      
      // Skip bucket creation statement
      if (statement.includes('storage.create_bucket')) {
        console.log('⏭️  Skipping bucket creation statement');
        continue;
      }
      
      try {
        console.log(`📝 Executing: ${statement.substring(0, 100)}${statement.length > 100 ? '...' : ''}`);
        
        // Use the proper RPC method for executing SQL
        const { data, error } = await supabase.rpc('execute_sql', { sql: statement });
        
        if (error) {
          // Some statements might fail if they already exist, which is OK
          if (error.message.includes('already exists') || error.message.includes('duplicate')) {
            console.log(`⚠️  Non-critical error (continuing): ${error.message}`);
          } else {
            console.error(`❌ Error executing statement: ${error.message}`);
            return false;
          }
        } else {
          console.log('✅ Statement executed successfully');
        }
      } catch (err) {
        console.error(`❌ Exception executing statement: ${err.message}`);
        return false;
      }
    }
    
    console.log(`✅ Migration applied successfully: ${filePath}\n`);
    return true;
  } catch (error) {
    console.error(`❌ Error applying migration ${filePath}: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Applying RLS and Storage policy fixes...\n');
  
  // Apply migrations in order
  for (const migrationFile of migrationFiles) {
    const success = await applyMigration(migrationFile);
    if (!success) {
      console.error('❌ Failed to apply migrations. Exiting.');
      process.exit(1);
    }
  }
  
  console.log('🎉 All policy fixes applied successfully!');
  console.log('\n📋 Next steps:');
  console.log('1. Create the "programas" storage bucket manually through the Supabase dashboard');
  console.log('2. Restart your development server');
  console.log('3. Test the assignment generation functionality');
  console.log('4. Verify that PDF uploads work correctly');
  console.log('5. Check that duplicate handling works with the new modal');
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed with error:', error);
  process.exit(1);
});