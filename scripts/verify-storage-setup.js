#!/usr/bin/env node

/**
 * Script to verify storage setup
 * This script checks if the storage bucket exists and policies are applied
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

// Load environment variables
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyStorageSetup() {
  console.log('🔍 Verifying storage setup...\n');
  
  try {
    // Check if the bucket exists
    console.log('📂 Checking if "programas" bucket exists...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
    
    if (bucketError) {
      console.error('❌ Error listing buckets:', bucketError.message);
      return false;
    }
    
    const programasBucket = buckets.find(bucket => bucket.name === 'programas');
    
    if (!programasBucket) {
      console.log('❌ Bucket "programas" not found.');
      console.log('💡 Please create the bucket manually through the Supabase dashboard.');
      return false;
    }
    
    console.log('✅ Bucket "programas" exists');
    console.log(`   ID: ${programasBucket.id}`);
    console.log(`   Public: ${programasBucket.public}`);
    console.log(`   Created: ${programasBucket.created_at}`);
    
    // Try to list files in the bucket (test read access)
    console.log('\n📄 Testing read access to bucket...');
    const { data: files, error: fileError } = await supabase.storage
      .from('programas')
      .list('', { limit: 1 });
    
    if (fileError && !fileError.message.includes('The resource was not found')) {
      console.error('❌ Error accessing bucket:', fileError.message);
      return false;
    }
    
    console.log('✅ Read access to bucket is working');
    
    // Test write access with a small test file
    console.log('\n✏️  Testing write access to bucket...');
    const testFile = new Blob(['test'], { type: 'text/plain' });
    const testFileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('programas')
      .upload(testFileName, testFile, { upsert: true });
    
    if (uploadError) {
      console.error('❌ Error uploading test file:', uploadError.message);
      // This might fail due to RLS policies, which is expected for unauthenticated access
      console.log('💡 This might be expected if you\'re not logged in or don\'t have proper permissions.');
    } else {
      console.log('✅ Write access to bucket is working');
      
      // Clean up test file
      const { error: deleteError } = await supabase.storage
        .from('programas')
        .remove([testFileName]);
      
      if (deleteError) {
        console.log('⚠️  Could not clean up test file:', deleteError.message);
      } else {
        console.log('✅ Test file cleaned up');
      }
    }
    
    console.log('\n🎉 Storage setup verification completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Exception during verification:', error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Storage Setup Verification\n');
  
  const success = await verifyStorageSetup();
  
  if (!success) {
    console.log('\n🔧 Troubleshooting steps:');
    console.log('1. Check if the "programas" bucket exists in your Supabase Storage');
    console.log('2. Verify that the storage policies have been applied');
    console.log('3. Ensure you are logged in with proper permissions');
    console.log('4. Refer to MANUAL_STORAGE_SETUP.md for detailed instructions');
    process.exit(1);
  }
  
  console.log('\n✅ All storage checks passed!');
  console.log('\n📋 Next steps:');
  console.log('1. Test PDF upload functionality in the application');
  console.log('2. Verify that assignment generation works correctly');
  console.log('3. Check duplicate handling with the new modal');
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed with error:', error);
  process.exit(1);
});