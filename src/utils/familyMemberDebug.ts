/**
 * Debug utilities for Family Member functionality
 * 
 * These functions can be called from the browser console to debug
 * family member insertion issues.
 */

import { supabase } from '@/integrations/supabase/client';

// Test function to check authentication state
export const debugAuthState = async () => {
  console.log('🔍 Debugging Authentication State...');
  
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError) {
      console.error('❌ Error getting user:', userError);
      return { success: false, error: userError };
    }
    
    console.log('✅ Current user:', {
      id: user?.id,
      email: user?.email,
      created_at: user?.created_at,
    });
    
    // Test if we can query family_members
    const { data: familyMembers, error: queryError } = await supabase
      .from('family_members')
      .select('*')
      .limit(1);
    
    if (queryError) {
      console.error('❌ Error querying family_members:', queryError);
      return { success: false, error: queryError };
    }
    
    console.log('✅ Family members query successful, count:', familyMembers?.length || 0);
    
    return { 
      success: true, 
      user: user ? { id: user.id, email: user.email } : null,
      canQueryFamilyMembers: true 
    };
  } catch (error) {
    console.error('❌ Exception in debugAuthState:', error);
    return { success: false, error };
  }
};

// Test function to insert a family member
export const debugFamilyMemberInsert = async (studentId: string) => {
  console.log('🧪 Testing Family Member Insert...');
  console.log('🔍 Student ID:', studentId);

  try {
    // First check auth state
    const authResult = await debugAuthState();
    if (!authResult.success) {
      console.error('❌ Auth check failed, cannot proceed with insert');
      return authResult;
    }

    // Test data
    const testFamilyMember = {
      student_id: studentId,
      name: 'Test Family Member Debug',
      email: 'test-debug@example.com',
      phone: '+44 7386 797715',
      gender: 'F' as const,
      relation: 'Irmã' as const,
    };

    console.log('🚀 Attempting to insert test family member:', testFamilyMember);

    const { data, error } = await supabase
      .from('family_members')
      .insert(testFamilyMember)
      .select()
      .single();

    if (error) {
      console.error('❌ Insert failed:', error);
      console.error('❌ Error details:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return { success: false, error };
    }

    console.log('✅ Insert successful:', data);

    // Test invitation sending
    console.log('🧪 Testing invitation sending...');
    try {
      const { data: invitation, error: inviteError } = await supabase
        .from('invitations_log')
        .insert({
          family_member_id: data.id,
          sent_by_student_id: studentId,
          invite_method: 'EMAIL',
        })
        .select()
        .single();

      if (inviteError) {
        console.error('❌ Invitation creation failed:', inviteError);
      } else {
        console.log('✅ Invitation log created:', invitation);

        // Clean up invitation
        await supabase.from('invitations_log').delete().eq('id', invitation.id);
        console.log('🧹 Invitation log cleaned up');
      }
    } catch (inviteError) {
      console.error('❌ Exception testing invitation:', inviteError);
    }

    // Clean up - delete the test record
    const { error: deleteError } = await supabase
      .from('family_members')
      .delete()
      .eq('id', data.id);

    if (deleteError) {
      console.warn('⚠️ Could not delete test record:', deleteError);
    } else {
      console.log('🧹 Test record cleaned up');
    }

    return { success: true, data };
  } catch (error) {
    console.error('❌ Exception in debugFamilyMemberInsert:', error);
    return { success: false, error };
  }
};

// Test the complete invitation flow
export const debugInvitationFlow = async (studentId: string) => {
  console.log('🧪 Testing Complete Invitation Flow...');

  try {
    // Step 1: Create a test family member
    const testFamilyMember = {
      student_id: studentId,
      name: 'Sarah Test Invitation',
      email: 'sarah.test@example.com',
      phone: '+44 7386 797715',
      gender: 'F' as const,
      relation: 'Irmã' as const,
    };

    console.log('📝 Step 1: Creating test family member...');
    const { data: familyMember, error: insertError } = await supabase
      .from('family_members')
      .insert(testFamilyMember)
      .select()
      .single();

    if (insertError) {
      console.error('❌ Failed to create test family member:', insertError);
      return { success: false, error: insertError };
    }

    console.log('✅ Test family member created:', familyMember);

    // Step 2: Test invitation creation
    console.log('📧 Step 2: Testing invitation creation...');
    const { data: invitation, error: invitationError } = await supabase
      .from('invitations_log')
      .insert({
        family_member_id: familyMember.id,
        sent_by_student_id: studentId,
        invite_method: 'EMAIL',
      })
      .select()
      .single();

    if (invitationError) {
      console.error('❌ Failed to create invitation:', invitationError);
      // Clean up family member
      await supabase.from('family_members').delete().eq('id', familyMember.id);
      return { success: false, error: invitationError };
    }

    console.log('✅ Invitation created:', invitation);

    // Step 3: Generate invitation link
    const invitationLink = `${window.location.origin}/convite/aceitar?token=${invitation.invitation_token}`;
    console.log('🔗 Invitation link:', invitationLink);

    // Step 4: Test invitation acceptance URL
    console.log('🔍 Step 3: Testing invitation acceptance URL structure...');
    const urlTest = new URL(invitationLink);
    const token = urlTest.searchParams.get('token');

    if (token === invitation.invitation_token) {
      console.log('✅ Invitation URL structure is correct');
    } else {
      console.error('❌ Invitation URL structure is incorrect');
    }

    // Clean up
    console.log('🧹 Cleaning up test data...');
    await supabase.from('invitations_log').delete().eq('id', invitation.id);
    await supabase.from('family_members').delete().eq('id', familyMember.id);
    console.log('✅ Test data cleaned up');

    return {
      success: true,
      familyMember,
      invitation,
      invitationLink,
      message: 'Complete invitation flow test successful!'
    };

  } catch (error) {
    console.error('❌ Exception in debugInvitationFlow:', error);
    return { success: false, error };
  }
};

// Test function to check RLS policies
export const debugRLSPolicies = async (studentId: string) => {
  console.log('🔒 Testing RLS Policies...');
  
  try {
    // Test SELECT policy
    console.log('🔍 Testing SELECT policy...');
    const { data: selectData, error: selectError } = await supabase
      .from('family_members')
      .select('*')
      .eq('student_id', studentId);
    
    if (selectError) {
      console.error('❌ SELECT policy test failed:', selectError);
    } else {
      console.log('✅ SELECT policy works, found records:', selectData?.length || 0);
    }
    
    // Test INSERT policy with a temporary record
    console.log('🔍 Testing INSERT policy...');
    const testRecord = {
      student_id: studentId,
      name: 'RLS Test Record',
      email: 'rls-test@example.com',
      gender: 'M' as const,
      relation: 'Irmão' as const,
    };
    
    const { data: insertData, error: insertError } = await supabase
      .from('family_members')
      .insert(testRecord)
      .select()
      .single();
    
    if (insertError) {
      console.error('❌ INSERT policy test failed:', insertError);
      return { success: false, selectWorks: !selectError, insertWorks: false, error: insertError };
    }
    
    console.log('✅ INSERT policy works, created record:', insertData.id);
    
    // Test UPDATE policy
    console.log('🔍 Testing UPDATE policy...');
    const { data: updateData, error: updateError } = await supabase
      .from('family_members')
      .update({ name: 'RLS Test Record Updated' })
      .eq('id', insertData.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('❌ UPDATE policy test failed:', updateError);
    } else {
      console.log('✅ UPDATE policy works');
    }
    
    // Test DELETE policy
    console.log('🔍 Testing DELETE policy...');
    const { error: deleteError } = await supabase
      .from('family_members')
      .delete()
      .eq('id', insertData.id);
    
    if (deleteError) {
      console.error('❌ DELETE policy test failed:', deleteError);
    } else {
      console.log('✅ DELETE policy works');
    }
    
    return {
      success: true,
      selectWorks: !selectError,
      insertWorks: !insertError,
      updateWorks: !updateError,
      deleteWorks: !deleteError,
    };
  } catch (error) {
    console.error('❌ Exception in debugRLSPolicies:', error);
    return { success: false, error };
  }
};

// Comprehensive debug function
export const debugFamilyMemberIssue = async (studentId: string) => {
  console.log('🚀 Starting Comprehensive Family Member Debug...');
  console.log('=' .repeat(60));
  
  const results = {
    authState: await debugAuthState(),
    rlsPolicies: await debugRLSPolicies(studentId),
    insertTest: await debugFamilyMemberInsert(studentId),
  };
  
  console.log('📊 Debug Results Summary:');
  console.log('=' .repeat(60));
  console.log('Auth State:', results.authState.success ? '✅ OK' : '❌ FAILED');
  console.log('RLS Policies:', results.rlsPolicies.success ? '✅ OK' : '❌ FAILED');
  console.log('Insert Test:', results.insertTest.success ? '✅ OK' : '❌ FAILED');
  
  if (!results.authState.success) {
    console.log('🔍 Auth issue detected - check user authentication');
  }
  
  if (!results.rlsPolicies.success) {
    console.log('🔍 RLS policy issue detected - check database permissions');
  }
  
  if (!results.insertTest.success) {
    console.log('🔍 Insert issue detected - check database constraints and data');
  }
  
  return results;
};

// Make functions available globally for console debugging
if (typeof window !== 'undefined') {
  (window as any).debugFamilyMember = {
    authState: debugAuthState,
    insert: debugFamilyMemberInsert,
    rls: debugRLSPolicies,
    comprehensive: debugFamilyMemberIssue,
    invitationFlow: debugInvitationFlow,
  };

  console.log('🔧 Family Member Debug Tools Available:');
  console.log('   window.debugFamilyMember.authState()');
  console.log('   window.debugFamilyMember.insert(studentId)');
  console.log('   window.debugFamilyMember.rls(studentId)');
  console.log('   window.debugFamilyMember.comprehensive(studentId)');
  console.log('   window.debugFamilyMember.invitationFlow(studentId)');
  console.log('');
  console.log('🎯 Quick Test Command:');
  console.log('   window.debugFamilyMember.invitationFlow("77c99e53-500b-4140-b7fc-a69f96b216e1")');
}
