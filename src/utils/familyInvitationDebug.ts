import { supabase } from '@/integrations/supabase/client';

/**
 * Comprehensive debugging utility for the Family Invitation system
 * This helps identify and resolve issues with family member addition and invitation sending
 */

export interface DebugInfo {
  timestamp: string;
  authState: {
    isAuthenticated: boolean;
    userId: string | null;
    userEmail: string | null;
    sessionValid: boolean;
  };
  databaseConnectivity: {
    canConnect: boolean;
    error?: string;
  };
  rlsPolicies: {
    familyMembersAccess: boolean;
    invitationsLogAccess: boolean;
    error?: string;
  };
  edgeFunction: {
    available: boolean;
    error?: string;
  };
}

/**
 * Runs comprehensive diagnostics on the Family Invitation system
 */
export async function runFamilyInvitationDiagnostics(): Promise<DebugInfo> {
  const timestamp = new Date().toISOString();
  console.log('🔍 Starting Family Invitation System Diagnostics...');

  // Check authentication state
  const authState = await checkAuthenticationState();
  console.log('🔐 Auth State:', authState);

  // Check database connectivity
  const databaseConnectivity = await checkDatabaseConnectivity();
  console.log('🗄️ Database Connectivity:', databaseConnectivity);

  // Check RLS policies
  const rlsPolicies = await checkRLSPolicies();
  console.log('🛡️ RLS Policies:', rlsPolicies);

  // Check Edge Function availability
  const edgeFunction = await checkEdgeFunctionAvailability();
  console.log('⚡ Edge Function:', edgeFunction);

  const debugInfo: DebugInfo = {
    timestamp,
    authState,
    databaseConnectivity,
    rlsPolicies,
    edgeFunction,
  };

  console.log('📊 Complete Diagnostic Report:', debugInfo);
  return debugInfo;
}

/**
 * Checks the current authentication state
 */
async function checkAuthenticationState() {
  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    return {
      isAuthenticated: !!user && !!session,
      userId: user?.id || null,
      userEmail: user?.email || null,
      sessionValid: !!session && !sessionError && !userError,
    };
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('❌ Error checking auth state:', errorMessage);
    return {
      isAuthenticated: false,
      userId: null,
      userEmail: null,
      sessionValid: false,
    };
  }
}

/**
 * Checks basic database connectivity
 */
async function checkDatabaseConnectivity() {
  try {
    // Try a simple query to test connectivity
    const { data, error } = await supabase
      .from('profiles')
      .select('id')
      .limit(1);

    if (error) {
      return {
        canConnect: false,
        error: error.message,
      };
    }

    return {
      canConnect: true,
    };
  } catch (error: unknown) {
    return {
      canConnect: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Checks RLS policies for family_members and invitations_log tables
 */
async function checkRLSPolicies() {
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

    const familyMembersAccess = !familyError;
    const invitationsLogAccess = !invitationError;

    let error: string | undefined;
    if (familyError || invitationError) {
      error = `Family Members: ${familyError?.message || 'OK'}, Invitations: ${invitationError?.message || 'OK'}`;
    }

    return {
      familyMembersAccess,
      invitationsLogAccess,
      error,
    };
  } catch (error: unknown) {
    return {
      familyMembersAccess: false,
      invitationsLogAccess: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Checks Edge Function availability
 */
async function checkEdgeFunctionAvailability() {
  try {
    // Try to invoke the Edge Function with a test payload
    const { data, error } = await supabase.functions.invoke('send-family-invitation', {
      body: { test: true },
    });

    if (error) {
      return {
        available: false,
        error: error.message,
      };
    }

    return {
      available: true,
    };
  } catch (error: unknown) {
    return {
      available: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Tests family member creation with detailed logging
 */
export async function testFamilyMemberCreation(studentId: string, testData: {
  name: string;
  email: string;
  gender: 'M' | 'F';
  relation: string;
}) {
  console.log('🧪 Testing family member creation...');
  
  try {
    // Run diagnostics first
    const diagnostics = await runFamilyInvitationDiagnostics();
    
    if (!diagnostics.authState.isAuthenticated) {
      throw new Error('User not authenticated');
    }

    if (!diagnostics.databaseConnectivity.canConnect) {
      throw new Error(`Database connectivity issue: ${diagnostics.databaseConnectivity.error}`);
    }

    if (!diagnostics.rlsPolicies.familyMembersAccess) {
      throw new Error(`RLS policy issue: ${diagnostics.rlsPolicies.error}`);
    }

    // Attempt to create family member
    const { data, error } = await supabase
      .from('family_members')
      .insert({
        student_id: studentId,
        name: testData.name,
        email: testData.email,
        gender: testData.gender,
        relation: (testData.relation as any),
        invitation_status: 'PENDING',
      } as any)
      .select()
      .single();

    if (error) {
      console.error('❌ Family member creation failed:', error);
      throw error;
    }

    console.log('✅ Family member created successfully:', data);
    
    // Clean up test data
    await supabase
      .from('family_members')
      .delete()
      .eq('id', data.id);

    console.log('🧹 Test data cleaned up');
    
    return { success: true, data };
  } catch (error) {
    console.error('❌ Family member creation test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Displays diagnostic information in a user-friendly format
 */
export function displayDiagnostics(debugInfo: DebugInfo) {
  const issues: string[] = [];
  const successes: string[] = [];

  // Check authentication
  if (debugInfo.authState.isAuthenticated) {
    successes.push('✅ Usuário autenticado');
  } else {
    issues.push('❌ Usuário não autenticado');
  }

  // Check database connectivity
  if (debugInfo.databaseConnectivity.canConnect) {
    successes.push('✅ Conectividade com banco de dados');
  } else {
    issues.push(`❌ Problema de conectividade: ${debugInfo.databaseConnectivity.error}`);
  }

  // Check RLS policies
  if (debugInfo.rlsPolicies.familyMembersAccess && debugInfo.rlsPolicies.invitationsLogAccess) {
    successes.push('✅ Políticas RLS funcionando');
  } else {
    issues.push(`❌ Problema com políticas RLS: ${debugInfo.rlsPolicies.error}`);
  }

  // Check Edge Function
  if (debugInfo.edgeFunction.available) {
    successes.push('✅ Edge Function disponível');
  } else {
    issues.push(`⚠️ Edge Function indisponível (modo desenvolvimento): ${debugInfo.edgeFunction.error}`);
  }

  return { issues, successes };
}
