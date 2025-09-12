// Test script to verify credentials work
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nwpuurgwnnuejqinkvrh.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im53cHV1cmd3bm51ZWpxaW5rdnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ0NjIwNjUsImV4cCI6MjA3MDAzODA2NX0.UHjSvXYY_c-_ydAIfELRUs4CMEBLKiztpBGQBNPHfak';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testCredentials() {
  console.log('🧪 Testing credentials...');
  
  // Test admin login
  console.log('\n1. Testing admin login...');
  try {
    const { data: adminData, error: adminError } = await supabase.auth.signInWithPassword({
      email: 'amazonwebber007@gmail.com',
      password: 'admin123'
    });
    
    if (adminError) {
      console.log('❌ Admin login failed:', adminError.message);
    } else {
      console.log('✅ Admin login successful:', adminData.user?.email);
      await supabase.auth.signOut();
    }
  } catch (error) {
    console.log('❌ Admin login exception:', error.message);
  }
  
  // Test instructor login
  console.log('\n2. Testing instructor login...');
  try {
    const { data: instructorData, error: instructorError } = await supabase.auth.signInWithPassword({
      email: 'frankwebber33@hotmail.com',
      password: 'senha123'
    });
    
    if (instructorError) {
      console.log('❌ Instructor login failed:', instructorError.message);
    } else {
      console.log('✅ Instructor login successful:', instructorData.user?.email);
      await supabase.auth.signOut();
    }
  } catch (error) {
    console.log('❌ Instructor login exception:', error.message);
  }
  
  // Test student login
  console.log('\n3. Testing student login...');
  try {
    const { data: studentData, error: studentError } = await supabase.auth.signInWithPassword({
      email: 'franklinmarceloferreiradelima@gmail.com',
      password: 'senha123'
    });
    
    if (studentError) {
      console.log('❌ Student login failed:', studentError.message);
    } else {
      console.log('✅ Student login successful:', studentData.user?.email);
      await supabase.auth.signOut();
    }
  } catch (error) {
    console.log('❌ Student login exception:', error.message);
  }
  
  console.log('\n🏁 Test completed');
}

testCredentials();