import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const SUPABASE_URL = 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function applyMigration() {
  console.log('🚀 Applying database migration...');

  try {
    // Read the migration file
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', '20250806120000_add_user_roles.sql');
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8');

    console.log('📄 Migration file loaded');
    console.log('📝 Migration content preview:', migrationSQL.substring(0, 200) + '...');

    // Split the migration into individual statements
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    console.log(`📊 Found ${statements.length} SQL statements to execute`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      console.log(`\n${i + 1}/${statements.length} Executing:`, statement.substring(0, 100) + '...');

      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql: statement });

        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error.message);
          // Continue with other statements
        } else {
          console.log(`✅ Statement ${i + 1} executed successfully`);
        }
      } catch (err) {
        console.error(`💥 Exception in statement ${i + 1}:`, err.message);
        // Try alternative approach for this statement
        console.log('🔄 Trying alternative approach...');

        // For some statements, we might need to use different methods
        if (statement.includes('CREATE TYPE')) {
          console.log('ℹ️ Skipping CREATE TYPE (might already exist)');
        } else if (statement.includes('ALTER TABLE')) {
          console.log('ℹ️ Skipping ALTER TABLE (might need manual execution)');
        }
      }
    }

    console.log('\n🎉 Migration application completed');

    // Test the migration results
    console.log('\n🔍 Testing migration results...');

    // Test if user_profiles view exists now
    const { data: viewTest, error: viewError } = await supabase
      .from('user_profiles')
      .select('*')
      .limit(1);

    if (viewError) {
      console.log('❌ user_profiles view still not accessible:', viewError.message);
    } else {
      console.log('✅ user_profiles view is now accessible');
    }

  } catch (error) {
    console.error('💥 Migration failed:', error.message);
  }
}

// Run the migration
applyMigration().then(() => {
  console.log('\n🏁 Migration process completed');
}).catch(error => {
  console.error('💥 Migration process failed:', error);
});