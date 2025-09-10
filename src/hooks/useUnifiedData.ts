import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useGlobalData } from '@/contexts/GlobalDataContext';
import { EventBus, useEventBus } from '@/utils/EventBus';

// ==============================================================================
// 🎯 UNIFIED DATA HOOK - Hook Unificado para Todos os Dashboards
// ==============================================================================

export function useUnifiedData() {
  const { profile } = useAuth();
  const {
    state,
    loadAllData,
    loadStudents,
    loadPrograms,
    loadAssignments,
    refreshStats,
    invalidateCache,
    isDataStale,
    getAdminData,
    getInstructorData,
    getStudentData
  } = useGlobalData();

  // Get role-specific data
  const getRoleData = useCallback(() => {
    if (!profile?.role) return null;

    switch (profile.role) {
      case 'admin':
        return getAdminData();
      case 'instrutor':
        return getInstructorData();
      case 'estudante':
        return getStudentData();
      default:
        return null;
    }
  }, [profile?.role, getAdminData, getInstructorData, getStudentData]);

  // Listen to relevant events based on role
  useEventBus('dashboard:data-updated', (data) => {
    // Refresh stats when data is updated
    refreshStats();
  });

  useEventBus('student:created', () => {
    loadStudents();
  });

  useEventBus('assignment:confirmed', () => {
    loadAssignments();
  });

  useEventBus('assignment:declined', () => {
    loadAssignments();
  });

  useEventBus('program:created', () => {
    loadPrograms();
  });

  // Smart refresh - only refresh if data is stale
  const smartRefresh = useCallback(async () => {
    if (isDataStale()) {
      await loadAllData();
      EventBus.emit('dashboard:data-updated', { 
        type: 'programs', // Generic type for full refresh
        count: state.students.length + state.programs.length + state.assignments.length 
      });
    }
  }, [isDataStale, loadAllData, state]);

  // Force refresh (ignores cache)
  const forceRefresh = useCallback(async () => {
    invalidateCache();
    await loadAllData();
    EventBus.emit('dashboard:data-updated', { 
      type: 'programs', // Generic type for full refresh
      count: state.students.length + state.programs.length + state.assignments.length 
    });
  }, [invalidateCache, loadAllData, state]);

  // Create new student (for instructors)
  const createStudent = useCallback(async (studentData: any) => {
    // Implementation would go here
    // After creation:
    EventBus.emit('student:created', { student: studentData });
  }, []);

  // Confirm assignment (for students)
  const confirmAssignment = useCallback(async (assignmentId: string) => {
    // Implementation would go here  
    // After confirmation:
    EventBus.emit('assignment:confirmed', { assignmentId, studentId: profile?.id || '' });
  }, [profile?.id]);

  // Decline assignment (for students)
  const declineAssignment = useCallback(async (assignmentId: string, reason?: string) => {
    // Implementation would go here
    // After declining:
    EventBus.emit('assignment:declined', { assignmentId, studentId: profile?.id || '', reason });
  }, [profile?.id]);

  // Create program (for instructors/admin)
  const createProgram = useCallback(async (programData: any) => {
    // Implementation would go here
    // After creation:
    EventBus.emit('program:created', { program: programData });
  }, []);

  return {
    // State
    ...state,
    roleData: getRoleData(),
    
    // Loading states
    isLoading: state.isLoading,
    isRefreshing: state.isRefreshing,
    error: state.error,
    
    // Cache info
    isDataStale: isDataStale(),
    lastCacheUpdate: state.lastCacheUpdate,
    
    // Data refresh actions
    smartRefresh,
    forceRefresh,
    refreshStats,
    
    // Specific data loaders
    loadStudents,
    loadPrograms,
    loadAssignments,
    
    // Cache management  
    invalidateCache,
    
    // CRUD operations (emit events automatically)
    createStudent,
    confirmAssignment,
    declineAssignment,
    createProgram,
    
    // Role-specific helpers
    isAdmin: profile?.role === 'admin',
    isInstructor: profile?.role === 'instrutor',
    isStudent: profile?.role === 'estudante',
    
    // Quick access to filtered data
    myStudents: state.students,
    myPrograms: state.programs,
    myAssignments: state.assignments.filter(a => 
      profile?.role === 'estudante' ? a.id_estudante === profile.id : true
    ),
    pendingAssignments: state.assignments.filter(a => !a.confirmado),
    confirmedAssignments: state.assignments.filter(a => a.confirmado),
    activePrograms: state.programs.filter(p => p.status === 'ativo'),
    
    // Stats shortcuts based on role
    get primaryStats() {
      const roleData = getRoleData();
      if (!roleData) return null;
      return roleData.stats;
    }
  };
}

// Specialized hooks for each dashboard type
export function useAdminData() {
  const unifiedData = useUnifiedData();
  const { isAdmin } = unifiedData;
  
  if (!isAdmin) {
    throw new Error('useAdminData can only be used by admin users');
  }
  
  return {
    ...unifiedData,
    adminStats: unifiedData.roleData?.stats,
    allPrograms: unifiedData.roleData?.allPrograms,
    systemHealth: unifiedData.roleData?.systemHealth
  };
}

export function useInstructorData() {
  const unifiedData = useUnifiedData();
  const { isInstructor } = unifiedData;
  
  if (!isInstructor) {
    throw new Error('useInstructorData can only be used by instructor users');
  }
  
  return {
    ...unifiedData,
    instructorStats: unifiedData.roleData?.stats,
    congregationStudents: unifiedData.roleData?.students,
    congregationPrograms: unifiedData.roleData?.programs,
    congregationAssignments: unifiedData.roleData?.assignments
  };
}

export function useStudentData() {
  const unifiedData = useUnifiedData();
  const { isStudent } = unifiedData;
  
  if (!isStudent) {
    throw new Error('useStudentData can only be used by student users');
  }
  
  return {
    ...unifiedData,
    studentStats: unifiedData.roleData?.stats,
    personalAssignments: unifiedData.roleData?.myAssignments,
    availablePrograms: unifiedData.roleData?.availablePrograms
  };
}