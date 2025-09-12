#!/usr/bin/env node

/**
 * Simple script to create the 'programas' storage bucket
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

async function createStorageBucket() {
  try {
    console.log('📂 Creating storage bucket: programas');
    
    // Try to create the bucket
    const { data, error } = await supabase.storage.createBucket('programas', {
      public: true,
      fileSizeLimit: 52428800, // 50MB
      allowedMimeTypes: ['application/pdf']
    });
    
    if (error) {
      // If bucket already exists, that's OK
      if (error.message.includes('already exists')) {
        console.log('✅ Storage bucket already exists');
        return true;
      }
      console.error(`❌ Error creating storage bucket: ${error.message}`);
      return false;
    }
    
    console.log('✅ Storage bucket created successfully');
    console.log('Bucket details:', data);
    return true;
  } catch (error) {
    console.error(`❌ Exception creating storage bucket: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log('🚀 Creating storage bucket...\n');
  
  const success = await createStorageBucket();
  if (!success) {
    console.error('❌ Failed to create storage bucket.');
    process.exit(1);
  }
  
  console.log('🎉 Storage bucket setup completed successfully!');
}

// Run the script
main().catch(error => {
  console.error('❌ Script failed with error:', error);
  process.exit(1);
});