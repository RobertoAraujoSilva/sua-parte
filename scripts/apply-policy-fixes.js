#!/usr/bin/env node

/**
 * Script to apply only policy fixes (without bucket creation)
 * This script provides instructions for manual bucket creation and applies policies
 */

import { config } from 'dotenv';
import fs from 'fs';
import path from 'path';

// Load environment variables from .env file
config();

console.log('📋 Policy Fix Application Script');
console.log('================================\n');

console.log('This script will help you apply the necessary policies for the application to work correctly.');
console.log('However, due to permission restrictions, you will need to manually create the storage bucket.\n');

console.log('🔧 STEP 1: MANUAL BUCKET CREATION');
console.log('---------------------------------');
console.log('1. Go to your Supabase project dashboard');
console.log('2. Navigate to Storage in the left sidebar');
console.log('3. Click "Create bucket"');
console.log('4. Enter the following details:');
console.log('   - Bucket name: programas');
console.log('   - Public bucket: Check this box');
console.log('5. Click "Create bucket"\n');

console.log('🔧 STEP 2: APPLY POLICIES');
console.log('-------------------------');
console.log('After creating the bucket, copy and paste the following SQL commands into the SQL Editor:\n');

// Read and display the policy migration files
const policyFiles = [
  'supabase/migrations/20250910133000_fix_assignment_history_rls.sql',
  'supabase/migrations/20250910193000_fix_assignment_history_insert_policies.sql',
  'supabase/migrations/20250910133500_fix_designacoes_rls_and_storage.sql',
  'supabase/migrations/20250910200000_fix_storage_policies_only.sql'
];

policyFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  if (fs.existsSync(filePath)) {
    console.log(`\n📄 ${file}:`);
    console.log('```sql');
    const content = fs.readFileSync(filePath, 'utf8');
    // Remove bucket creation lines
    const filteredContent = content
      .split('\n')
      .filter(line => !line.includes('storage.create_bucket'))
      .filter(line => !line.includes('DO $$'))
      .filter(line => !line.includes('END$$'))
      .filter(line => !line.trim().startsWith('--') || line.includes('CREATE POLICY') || line.includes('GRANT'))
      .join('\n')
      .trim();
    console.log(filteredContent);
    console.log('```');
  }
});

console.log('\n✅ After applying these policies:');
console.log('1. Restart your development server');
console.log('2. Test the PDF upload functionality');
console.log('3. Verify that assignment generation works correctly');
console.log('4. Check that duplicate handling works with the new modal\n');

console.log('📝 For detailed instructions, see MANUAL_STORAGE_SETUP.md in your project root.');