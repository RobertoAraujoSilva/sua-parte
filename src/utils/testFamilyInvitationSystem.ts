import { supabase } from '@/integrations/supabase/client';

/**
 * Comprehensive test suite for the Family Invitation system
 * This script tests the complete flow from family member creation to invitation acceptance
 */

export interface TestResult {
  step: string;
  success: boolean;
  error?: string;
  data?: any;
  duration?: number;
}

export interface TestSuite {
  testId: string;
  timestamp: string;
  results: TestResult[];
  overallSuccess: boolean;
  totalDuration: number;
}

/**
 * Runs a complete test of the family invitation system
 */
export async function runCompleteSystemTest(studentId: string): Promise<TestSuite> {
  const testId = `test_${Date.now()}`;
  const timestamp = new Date().toISOString();
  const results: TestResult[] = [];
  const startTime = Date.now();

  console.log(`🧪 Starting complete system test: ${testId}`);

  // Test 1: Authentication Check
  results.push(await testAuthentication());

  // Test 2: Database Connectivity
  results.push(await testDatabaseConnectivity());

  // Test 3: RLS Policies
  results.push(await testRLSPolicies());

  // Test 4: Family Member Creation
  const familyMemberResult = await testFamilyMemberCreation(studentId);
  results.push(familyMemberResult);

  let familyMemberId: string | null = null;
  if (familyMemberResult.success && familyMemberResult.data) {
    familyMemberId = familyMemberResult.data.id;
  }

  // Test 5: Invitation Log Creation
  if (familyMemberId) {
    results.push(await testInvitationLogCreation(familyMemberId, studentId));
  } else {
    results.push({
      step: 'Invitation Log Creation',
      success: false,
      error: 'Skipped due to family member creation failure'
    });
  }

  // Test 6: Edge Function Availability
  results.push(await testEdgeFunctionAvailability());

  // Test 7: Family Member Status Update
  if (familyMemberId) {
    results.push(await testFamilyMemberStatusUpdate(familyMemberId));
  } else {
    results.push({
      step: 'Family Member Status Update',
      success: false,
      error: 'Skipped due to family member creation failure'
    });
  }

  // Cleanup: Remove test data
  if (familyMemberId) {
    results.push(await cleanupTestData(familyMemberId));
  }

  const totalDuration = Date.now() - startTime;
  const overallSuccess = results.every(result => result.success);

  const testSuite: TestSuite = {
    testId,
    timestamp,
    results,
    overallSuccess,
    totalDuration
  };

  console.log(`🏁 Test completed: ${testId}`, testSuite);
  return testSuite;
}

async function testAuthentication(): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (sessionError || userError || !user || !session) {
      return {
        step: 'Authentication Check',
        success: false,
        error: 'User not authenticated or session invalid',
        duration: Date.now() - startTime
      };
    }

    return {
      step: 'Authentication Check',
      success: true,
      data: { userId: user.id, email: user.email },
      duration: Date.now() - startTime
    };
  } catch (error) {
    return {
      step: 'Authentication Check',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    };
  }
}

async function testDatabaseConnectivity(): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      return {
        step: 'Database Connectivity',
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }

    return {
      step: 'Database Connectivity',
      success: true,
      data: { recordCount: data?.length || 0 },
      duration: Date.now() - startTime
    };
  } catch (error) {
    return {
      step: 'Database Connectivity',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    };
  }
}

async function testRLSPolicies(): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    // Test family_members table access
    const { data: familyData, error: familyError } = await supabase
      .from('family_members')
      .select('id')
      .limit(1);

    // Test invitations_log table access
    const { data: invitationData, error: invitationError } = await supabase
      .from('invitations_log')
      .select('id')
      .limit(1);

    const errors = [];
    if (familyError) errors.push(`Family Members: ${familyError.message}`);
    if (invitationError) errors.push(`Invitations Log: ${invitationError.message}`);

    if (errors.length > 0) {
      return {
        step: 'RLS Policies Check',
        success: false,
        error: errors.join(', '),
        duration: Date.now() - startTime
      };
    }

    return {
      step: 'RLS Policies Check',
      success: true,
      data: { 
        familyMembersAccess: !familyError,
        invitationsLogAccess: !invitationError
      },
      duration: Date.now() - startTime
    };
  } catch (error) {
    return {
      step: 'RLS Policies Check',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    };
  }
}

async function testFamilyMemberCreation(studentId: string): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const testData = {
      student_id: studentId,
      name: `Test Family Member ${Date.now()}`,
      email: `test${Date.now()}@example.com`,
      gender: 'M' as const,
      relation: 'Irmão' as const,
      invitation_status: 'PENDING' as const,
    };

    const { data, error } = await supabase
      .from('family_members')
      .insert(testData)
      .select()
      .single();

    if (error) {
      return {
        step: 'Family Member Creation',
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }

    return {
      step: 'Family Member Creation',
      success: true,
      data: data,
      duration: Date.now() - startTime
    };
  } catch (error) {
    return {
      step: 'Family Member Creation',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    };
  }
}

async function testInvitationLogCreation(familyMemberId: string, studentId: string): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const { data, error } = await supabase
      .from('invitations_log')
      .insert({
        family_member_id: familyMemberId,
        sent_by_student_id: studentId,
        invite_method: 'EMAIL',
        invite_status: 'SENT',
      })
      .select()
      .single();

    if (error) {
      return {
        step: 'Invitation Log Creation',
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }

    return {
      step: 'Invitation Log Creation',
      success: true,
      data: data,
      duration: Date.now() - startTime
    };
  } catch (error) {
    return {
      step: 'Invitation Log Creation',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    };
  }
}

async function testEdgeFunctionAvailability(): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const { data, error } = await supabase.functions.invoke('send-family-invitation', {
      body: { test: true },
    });

    if (error) {
      return {
        step: 'Edge Function Availability',
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }

    return {
      step: 'Edge Function Availability',
      success: true,
      data: data,
      duration: Date.now() - startTime
    };
  } catch (error) {
    return {
      step: 'Edge Function Availability',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    };
  }
}

async function testFamilyMemberStatusUpdate(familyMemberId: string): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    const { data, error } = await supabase
      .from('family_members')
      .update({ invitation_status: 'SENT' })
      .eq('id', familyMemberId)
      .select()
      .single();

    if (error) {
      return {
        step: 'Family Member Status Update',
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }

    return {
      step: 'Family Member Status Update',
      success: true,
      data: data,
      duration: Date.now() - startTime
    };
  } catch (error) {
    return {
      step: 'Family Member Status Update',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    };
  }
}

async function cleanupTestData(familyMemberId: string): Promise<TestResult> {
  const startTime = Date.now();
  
  try {
    // Delete invitation logs first (due to foreign key constraint)
    await supabase
      .from('invitations_log')
      .delete()
      .eq('family_member_id', familyMemberId);

    // Delete family member
    const { error } = await supabase
      .from('family_members')
      .delete()
      .eq('id', familyMemberId);

    if (error) {
      return {
        step: 'Cleanup Test Data',
        success: false,
        error: error.message,
        duration: Date.now() - startTime
      };
    }

    return {
      step: 'Cleanup Test Data',
      success: true,
      duration: Date.now() - startTime
    };
  } catch (error) {
    return {
      step: 'Cleanup Test Data',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      duration: Date.now() - startTime
    };
  }
}
