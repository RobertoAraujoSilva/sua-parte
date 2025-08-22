import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { realDataFetcher, RealStudentData } from '@/utils/fetchRealDashboardData';
import {
  EstudanteWithProgress,
  StudentQualifications,
  StudentProgress,
  ProgressLevel,
  SpeechType,
  InstructorDashboardData,
  DragDropResult
} from '@/types/estudantes';

export const useInstructorDashboard = () => {
  const [data, setData] = useState<InstructorDashboardData>({
    students_by_progress: {
      beginning: [],
      developing: [],
      qualified: [],
      advanced: []
    },
    students_by_speech_type: {
      bible_reading: [],
      initial_call: [],
      return_visit: [],
      bible_study: [],
      talk: [],
      demonstration: []
    },
    recent_updates: [],
    statistics: {
      total_students: 0,
      by_progress_level: {
        beginning: 0,
        developing: 0,
        qualified: 0,
        advanced: 0
      },
      by_speech_type: {
        bible_reading: 0,
        initial_call: 0,
        return_visit: 0,
        bible_study: 0,
        talk: 0,
        demonstration: 0
      },
      active_students: 0,
      needs_attention: 0
    }
  });
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Load students with real progress data
  const loadStudentsData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('👥 Loading real students data for instructor dashboard...');

      // Fetch real students data
      const realStudents = await realDataFetcher.fetchStudents(100);

      // Transform real students to EstudanteWithProgress format
      const studentsWithProgress: EstudanteWithProgress[] = realStudents.map(student => {
        // Determine progress level based on real cargo data
        const getProgressLevel = (): ProgressLevel => {
          if (student.cargo === 'anciao' || student.cargo === 'servo_ministerial') return 'advanced';
          if (student.cargo === 'pioneiro_regular' || student.cargo === 'publicador_batizado') return 'qualified';
          if (student.cargo === 'publicador_nao_batizado') return 'developing';
          return 'beginning';
        };

        // Determine qualifications based on real S-38-T rules
        const getQualifications = (): StudentQualifications => {
          const progressLevel = getProgressLevel();
          const isMale = student.genero === 'masculino';
          const isQualified = ['anciao', 'servo_ministerial', 'pioneiro_regular', 'publicador_batizado'].includes(student.cargo);

          return {
            bible_reading: isMale && progressLevel !== 'beginning',
            initial_call: true, // All students can do initial calls
            return_visit: progressLevel !== 'beginning',
            bible_study: progressLevel === 'qualified' || progressLevel === 'advanced',
            talk: isMale && isQualified,
            demonstration: true, // All students can do demonstrations
            can_be_helper: progressLevel === 'qualified' || progressLevel === 'advanced',
            can_teach_others: progressLevel === 'advanced'
          };
        };

        const progressLevel = getProgressLevel();
        const qualifications = getQualifications();

        // Create progress object based on real data
        const progress: StudentProgress = {
          level: progressLevel,
          qualifications,
          last_assignment: null, // Will be populated from designacoes if needed
          next_assignment: null,
          notes: student.observacoes || '',
          needs_attention: !student.ativo || student.idade < 12 || student.idade > 80
        };

        return {
          ...student,
          progress,
          speech_types: Object.entries(qualifications)
            .filter(([key, value]) => value && ['bible_reading', 'initial_call', 'return_visit', 'bible_study', 'talk', 'demonstration'].includes(key))
            .map(([key]) => key as SpeechType)
        };
      });

      // Categorize students by progress level
      const studentsByProgress = {
        beginning: studentsWithProgress.filter(s => s.progress.level === 'beginning'),
        developing: studentsWithProgress.filter(s => s.progress.level === 'developing'),
        qualified: studentsWithProgress.filter(s => s.progress.level === 'qualified'),
        advanced: studentsWithProgress.filter(s => s.progress.level === 'advanced')
      };

      // Categorize students by speech type
      const studentsBySpeechType = {
        bible_reading: studentsWithProgress.filter(s => s.progress.qualifications.bible_reading),
        initial_call: studentsWithProgress.filter(s => s.progress.qualifications.initial_call),
        return_visit: studentsWithProgress.filter(s => s.progress.qualifications.return_visit),
        bible_study: studentsWithProgress.filter(s => s.progress.qualifications.bible_study),
        talk: studentsWithProgress.filter(s => s.progress.qualifications.talk),
        demonstration: studentsWithProgress.filter(s => s.progress.qualifications.demonstration)
      };

      // Calculate statistics from real data
      const statistics = {
        total_students: studentsWithProgress.length,
        by_progress_level: {
          beginning: studentsByProgress.beginning.length,
          developing: studentsByProgress.developing.length,
          qualified: studentsByProgress.qualified.length,
          advanced: studentsByProgress.advanced.length
        },
        by_speech_type: {
          bible_reading: studentsBySpeechType.bible_reading.length,
          initial_call: studentsBySpeechType.initial_call.length,
          return_visit: studentsBySpeechType.return_visit.length,
          bible_study: studentsBySpeechType.bible_study.length,
          talk: studentsBySpeechType.talk.length,
          demonstration: studentsBySpeechType.demonstration.length
        },
        active_students: studentsWithProgress.filter(s => s.ativo).length,
        needs_attention: studentsWithProgress.filter(s => s.progress.needs_attention).length
      };

      // Fetch recent activity
      const recentActivity = await realDataFetcher.fetchRecentActivity(10);

      setData({
        students_by_progress: studentsByProgress,
        students_by_speech_type: studentsBySpeechType,
        recent_updates: recentActivity,
        statistics
      });

      console.log('✅ Real instructor dashboard data loaded:', {
        totalStudents: statistics.total_students,
        byProgress: statistics.by_progress_level,
        bySpeechType: statistics.by_speech_type,
        activeStudents: statistics.active_students,
        needsAttention: statistics.needs_attention
      });

    } catch (err) {
      console.error('❌ Error loading real instructor dashboard data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
      toast({
        title: "Error",
        description: "Failed to load instructor dashboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  // Handle drag and drop for student progress updates
  const handleDragDrop = useCallback(async (result: DragDropResult) => {
    try {
      const { studentId, fromProgress, toProgress } = result;

      // Find the student
      const allStudents = [
        ...data.students_by_progress.beginning,
        ...data.students_by_progress.developing,
        ...data.students_by_progress.qualified,
        ...data.students_by_progress.advanced
      ];

      const student = allStudents.find(s => s.id === studentId);
      if (!student) return;

      // Update student progress in database
      const newCargo = getCargoFromProgressLevel(toProgress);
      
      const { error } = await supabase
        .from('estudantes')
        .update({ cargo: newCargo })
        .eq('id', studentId);

      if (error) throw error;

      // Update local state
      setData(prev => {
        const updatedStudent = { ...student, cargo: newCargo };
        
        // Remove from old category
        const fromCategory = prev.students_by_progress[fromProgress as keyof typeof prev.students_by_progress];
        const toCategory = prev.students_by_progress[toProgress as keyof typeof prev.students_by_progress];
        
        const newFromCategory = fromCategory.filter(s => s.id !== studentId);
        const newToCategory = [...toCategory, updatedStudent];

        return {
          ...prev,
          students_by_progress: {
            ...prev.students_by_progress,
            [fromProgress]: newFromCategory,
            [toProgress]: newToCategory
          }
        };
      });

      toast({
        title: "Success",
        description: `Student ${student.nome} moved to ${toProgress} level`,
      });

    } catch (err) {
      console.error('❌ Error updating student progress:', err);
      toast({
        title: "Error",
        description: "Failed to update student progress",
        variant: "destructive"
      });
    }
  }, [data, toast]);

  // Refresh data
  const refreshData = useCallback(async () => {
    await loadStudentsData();
  }, [loadStudentsData]);

  useEffect(() => {
    loadStudentsData();
  }, [loadStudentsData]);

  return {
    data,
    loading,
    error,
    handleDragDrop,
    refreshData
  };
};

// Helper function to map progress level to cargo
function getCargoFromProgressLevel(progressLevel: ProgressLevel): string {
  switch (progressLevel) {
    case 'beginning':
      return 'estudante_novo';
    case 'developing':
      return 'publicador_nao_batizado';
    case 'qualified':
      return 'publicador_batizado';
    case 'advanced':
      return 'anciao';
    default:
      return 'estudante_novo';
  }
}
