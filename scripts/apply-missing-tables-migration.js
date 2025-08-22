/**
 * Apply Missing Tables Migration
 * This script creates the missing tables that are causing 404 errors
 */

const fs = require('fs');
const path = require('path');

// Read the migration file
const migrationPath = path.join(__dirname, '../supabase/migrations/20250118000000_create_missing_tables.sql');
const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

// Import the Supabase client
const { createClient } = require('@supabase/supabase-js');

// Get environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - VITE_SUPABASE_URL or SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  try {
    console.log('🚀 Starting migration to create missing tables...');
    console.log('📝 Migration file:', migrationPath);
    
    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
    
    console.log(`📊 Found ${statements.length} SQL statements to execute`);
    
    // Execute statements one by one
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      
      if (statement.length === 0) continue;
      
      console.log(`⚡ Executing statement ${i + 1}/${statements.length}...`);
      
      try {
        const { error } = await supabase.rpc('exec_sql', { 
          sql: statement + ';'
        });
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error);
          console.error(`Statement: ${statement.substring(0, 100)}...`);
          return { success: false, error: error.message };
        }
        
        console.log(`✅ Statement ${i + 1} executed successfully`);
      } catch (statementError) {
        console.error(`❌ Failed to execute statement ${i + 1}:`, statementError);
        console.error(`Statement: ${statement.substring(0, 100)}...`);
        return { success: false, error: statementError.message };
      }
    }
    
    console.log('🎉 Migration completed successfully!');
    
    // Verify the migration by checking if the new tables exist
    console.log('🔍 Verifying schema...');
    
    const tablesToVerify = ['global_programming', 'workbook_versions', 'congregacoes'];
    
    for (const tableName of tablesToVerify) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('id')
          .limit(1);
        
        if (error) {
          console.warn(`⚠️ Warning: Could not verify table ${tableName}:`, error.message);
        } else {
          console.log(`✅ Table ${tableName} exists and is accessible`);
        }
      } catch (verifyError) {
        console.warn(`⚠️ Warning: Could not verify table ${tableName}:`, verifyError.message);
      }
    }
    
    console.log('✨ Schema verification completed!');
    return { success: true };
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    return { success: false, error: error.message };
  }
}

// Run the migration if this script is executed directly
if (require.main === module) {
  applyMigration()
    .then(result => {
      if (result.success) {
        console.log('🎉 Migration completed successfully!');
        process.exit(0);
      } else {
        console.error('❌ Migration failed:', result.error);
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('❌ Unexpected error:', error);
      process.exit(1);
    });
}

module.exports = { applyMigration };
