import { useState, useEffect, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { withRefreshTokenErrorHandling } from '@/utils/refreshTokenHandler';
import { 
  FamilyMember, 
  FamilyMemberInsert, 
  FamilyMemberUpdate,
  FamilyMemberWithInvitations,
  InvitationLog,
  InviteMethod
} from '@/types/family';

export const useFamilyMembers = (studentId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use current user ID if no studentId provided
  const targetStudentId = studentId || user?.id;

  // Debug authentication state
  useEffect(() => {
    console.log('🔍 useFamilyMembers - Auth state:', {
      user: user ? { id: user.id, email: user.email } : null,
      studentId,
      targetStudentId,
    });
  }, [user, studentId, targetStudentId]);

  // Fetch family members
  const {
    data: familyMembers = [],
    isLoading: isFetching,
    error: fetchError,
    refetch
  } = useQuery({
    queryKey: ['family-members', targetStudentId],
    queryFn: async (): Promise<FamilyMemberWithInvitations[]> => {
      if (!targetStudentId) throw new Error('No student ID provided');

      console.log('🔍 Fetching family members for student:', targetStudentId);

      // Fetch family members with their latest invitations
      const { data: members, error: membersError } = await supabase
        .from('family_members')
        .select(`
          *,
          invitations_log (
            id,
            family_member_id,
            sent_by_student_id,
            invite_method,
            invite_status,
            invitation_token,
            expires_at,
            created_at
          )
        `)
        .eq('student_id', targetStudentId)
        .order('created_at', { ascending: false });

      if (membersError) {
        console.error('❌ Error fetching family members:', membersError);
        throw membersError;
      }

      console.log('✅ Family members fetched:', members?.length || 0);

      // Process the data to include latest invitation and can_invite flag
      const processedMembers: FamilyMemberWithInvitations[] = (members || []).map(member => {
        const invitations = Array.isArray(member.invitations_log) ? member.invitations_log : [];
        const latestInvitation = invitations.length > 0 ? {
          ...invitations[0],
          user_id: member.user_id // Add user_id from parent member
        } : undefined;
        
        return {
          ...member,
          latest_invitation: latestInvitation,
          can_invite: !!(member.email || member.phone),
          invitations_log: undefined // Remove the nested data
        };
      });

      return processedMembers;
    },
    enabled: !!targetStudentId,
  });

  // Add family member mutation
  const addFamilyMemberMutation = useMutation({
    mutationFn: async (familyMemberData: FamilyMemberInsert): Promise<FamilyMember> => {
      console.log('➕ Adding family member:', familyMemberData.name);
      console.log('🔍 Current auth state:', {
        user: user ? { id: user.id, email: user.email } : null,
        targetStudentId,
        familyMemberData
      });

      // Verify authentication state
      if (!user) {
        console.error('❌ No authenticated user found');
        throw new Error('Você precisa estar logado para adicionar familiares');
      }

      if (!targetStudentId) {
        console.error('❌ No target student ID available');
        throw new Error('ID do estudante não encontrado');
      }

      // Verify current session with refresh token error handling
      const { data: { session }, error: sessionError } = await withRefreshTokenErrorHandling(async () => {
        return await supabase.auth.getSession();
      });
      if (sessionError || !session) {
        console.error('❌ No valid session found:', sessionError);
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      console.log('✅ Authentication verified, proceeding with insertion...');

      try {
        const { data, error } = await supabase
          .from('family_members')
          .insert(familyMemberData)
          .select()
          .single();

        if (error) {
          console.error('❌ Error adding family member:', error);
          console.error('❌ Error details:', {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code
          });

          // Provide more user-friendly error messages
          if (error.code === '42501') {
            throw new Error('Permissão negada. Verifique se você está logado corretamente.');
          } else if (error.code === '23505') {
            throw new Error('Este familiar já foi cadastrado.');
          } else {
            throw new Error(`Erro ao adicionar familiar: ${error.message}`);
          }
        }

        console.log('✅ Family member added successfully:', data.name);
        return data;
      } catch (error) {
        console.error('❌ Exception during family member addition:', error);
        throw error;
      }
    },
    onSuccess: (data) => {
      console.log('🎉 Mutation success, invalidating queries...');
      queryClient.invalidateQueries({ queryKey: ['family-members', targetStudentId] });
    },
    onError: (error) => {
      console.error('💥 Mutation failed:', error);
    },
  });

  // Update family member mutation
  const updateFamilyMemberMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: FamilyMemberUpdate }): Promise<FamilyMember> => {
      console.log('✏️ Updating family member:', id, updates);

      const { data, error } = await supabase
        .from('family_members')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating family member:', error);
        throw error;
      }

      console.log('✅ Family member updated:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members', targetStudentId] });
    },
  });

  // Delete family member mutation
  const deleteFamilyMemberMutation = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      console.log('🗑️ Deleting family member:', id);

      const { error } = await supabase
        .from('family_members')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting family member:', error);
        throw error;
      }

      console.log('✅ Family member deleted');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['family-members', targetStudentId] });
    },
  });

  // Send invitation mutation
  const sendInvitationMutation = useMutation({
    mutationFn: async ({
      familyMemberId,
      method
    }: {
      familyMemberId: string;
      method: InviteMethod;
    }): Promise<InvitationLog> => {
      console.log('📧 Starting invitation process:', { familyMemberId, method });

      // Verify authentication state
      if (!user) {
        console.error('❌ No authenticated user found');
        throw new Error('Você precisa estar logado para enviar convites');
      }

      if (!targetStudentId) {
        console.error('❌ No target student ID available');
        throw new Error('ID do estudante não encontrado');
      }

      // Verify current session with refresh token error handling
      const { data: { session }, error: sessionError } = await withRefreshTokenErrorHandling(async () => {
        return await supabase.auth.getSession();
      });
      if (sessionError || !session) {
        console.error('❌ No valid session found:', sessionError);
        throw new Error('Sessão expirada. Faça login novamente.');
      }

      console.log('✅ Authentication verified for invitation sending');

      // Get family member details
      const { data: familyMember, error: fetchError } = await supabase
        .from('family_members')
        .select('*')
        .eq('id', familyMemberId)
        .single();

      if (fetchError || !familyMember) {
        console.error('❌ Error fetching family member:', fetchError);
        throw new Error('Familiar não encontrado ou acesso negado');
      }

      console.log('✅ Family member found:', familyMember.name);

      // Validate contact information based on method
      if (method === 'EMAIL' && !familyMember.email) {
        throw new Error('Email é obrigatório para convites por email');
      }
      if (method === 'WHATSAPP' && !familyMember.phone) {
        throw new Error('Telefone é obrigatório para convites por WhatsApp');
      }

      try {
        console.log('📝 Creating invitation log entry...');

        // Create invitation log entry first
        const { data: invitation, error: invitationError } = await supabase
          .from('invitations_log')
          .insert({
            user_id: user.id,
            family_member_id: familyMemberId,
            sent_by_student_id: targetStudentId,
            invite_method: method,
          })
          .select()
          .single();

        if (invitationError) {
          console.error('❌ Error creating invitation log:', invitationError);
          console.error('❌ Invitation error details:', {
            message: invitationError.message,
            details: invitationError.details,
            hint: invitationError.hint,
            code: invitationError.code
          });

          // Provide user-friendly error messages
          if (invitationError.code === '42501') {
            throw new Error('Permissão negada para criar convite. Verifique se você está logado corretamente.');
          } else {
            throw new Error(`Erro ao criar convite: ${invitationError.message}`);
          }
        }

        console.log('✅ Invitation log created successfully:', invitation.id);

        // Try to send invitation using Supabase Edge Function (production)
        // Fall back to development mode if Edge Function is not available
        let invitationSent = false;

        try {
          console.log('📧 Attempting to send invitation via Edge Function...');

          const { data: functionResponse, error: functionError } = await supabase.functions.invoke(
            'send-family-invitation',
            {
              body: {
                familyMemberId,
                method,
              },
            }
          );

          if (functionError) {
            console.warn('⚠️ Edge Function error:', functionError);
            console.warn('⚠️ Falling back to development mode');
            throw functionError;
          }

          if (!functionResponse?.success) {
            console.warn('⚠️ Edge Function returned error:', functionResponse?.error);
            console.warn('⚠️ Falling back to development mode');
            throw new Error(functionResponse?.error || 'Edge Function returned unsuccessful response');
          }

          console.log('✅ Invitation sent successfully via Edge Function:', functionResponse);
          invitationSent = true;
        } catch (edgeFunctionError) {
          console.log('🔄 Edge Function failed, using development mode...');
          console.log('🔄 Edge Function error details:', edgeFunctionError);

          // Development mode: Create invitation link and show to user
          const invitationLink = `${window.location.origin}/convite/aceitar?token=${invitation.invitation_token}`;

          if (method === 'EMAIL') {
            console.log('📧 Development mode - Email invitation details:', {
              to: familyMember.email,
              subject: 'Convite para acessar o Sistema Ministerial',
              invitationLink,
              familyMemberName: familyMember.name,
              relation: familyMember.relation,
              invitedBy: user?.email
            });

            // Show invitation link to user for manual sending
            const message = `✅ Convite criado com sucesso para ${familyMember.name}!\n\n` +
              `📧 Email: ${familyMember.email}\n` +
              `🔗 Link de convite: ${invitationLink}\n\n` +
              `⚠️ MODO DESENVOLVIMENTO:\n` +
              `Copie este link e envie manualmente por email.\n` +
              `O link foi copiado automaticamente para a área de transferência.\n\n` +
              `Em produção, o email será enviado automaticamente.`;

            alert(message);

            // Copy link to clipboard
            try {
              if (navigator.clipboard) {
                await navigator.clipboard.writeText(invitationLink);
                console.log('📋 Invitation link copied to clipboard');
              }
            } catch (clipboardError) {
              console.warn('⚠️ Failed to copy to clipboard:', clipboardError);
            }
          }

          // Update family member status manually in development mode
          console.log('📝 Updating family member status to SENT...');

          const { error: updateError } = await supabase
            .from('family_members')
            .update({ invitation_status: 'SENT' })
            .eq('id', familyMemberId);

          if (updateError) {
            console.error('❌ Error updating family member status:', updateError);
            console.error('❌ Update error details:', {
              message: updateError.message,
              details: updateError.details,
              hint: updateError.hint,
              code: updateError.code
            });
            throw new Error(`Erro ao atualizar status do familiar: ${updateError.message}`);
          }

          invitationSent = true;
          console.log('✅ Development mode invitation prepared successfully');
        }

        // Handle WhatsApp invitations (always manual for now)
        if (method === 'WHATSAPP' && invitationSent) {
          console.log('📱 Opening WhatsApp for manual sending...');

          const invitationLink = `${window.location.origin}/convite/aceitar?token=${invitation.invitation_token}`;
          const whatsappMessage = encodeURIComponent(
            `Olá ${familyMember.name}! Você foi convidado(a) para acessar o Sistema Ministerial. ` +
            `Clique no link para ativar sua conta: ${invitationLink}`
          );
          const whatsappUrl = `https://wa.me/${familyMember.phone?.replace(/\D/g, '')}?text=${whatsappMessage}`;

          // Open WhatsApp with pre-filled message
          window.open(whatsappUrl, '_blank');

          console.log('✅ WhatsApp link opened for manual sending');
        }

        if (!invitationSent) {
          console.error('❌ Invitation was not sent successfully');
          throw new Error('Falha ao enviar convite. Tente novamente.');
        }

        console.log('✅ Invitation process completed successfully');
        console.log('✅ Final invitation data:', invitation);

        return invitation;
      } catch (error) {
        console.error('❌ Exception during invitation sending:', error);

        // Provide user-friendly error messages
        if (error instanceof Error) {
          throw error; // Re-throw if it's already a user-friendly error
        } else {
          throw new Error('Erro inesperado ao enviar convite. Tente novamente.');
        }
      }
    },
    onSuccess: () => {
      console.log('🎉 Invitation sent successfully, refreshing data...');
      queryClient.invalidateQueries({ queryKey: ['family-members', targetStudentId] });
    },
    onError: (error) => {
      console.error('💥 Invitation sending failed:', error);
    },
  });

  // Convenience methods
  const addFamilyMember = useCallback(async (familyMemberData: Omit<FamilyMemberInsert, 'student_id'>) => {
    console.log('🔄 Starting family member addition process...');

    if (!user) {
      console.error('❌ No authenticated user for adding family member');
      throw new Error('Você precisa estar logado para adicionar familiares');
    }

    if (!targetStudentId) {
      console.error('❌ No student ID available for adding family member');
      throw new Error('ID do estudante não encontrado');
    }

    console.log('🔄 Preparing to add family member:', {
      studentId: targetStudentId,
      familyMemberName: familyMemberData.name,
      relation: familyMemberData.relation
    });

    try {
      const result = await addFamilyMemberMutation.mutateAsync({
        ...familyMemberData,
        student_id: targetStudentId,
      });

      console.log('✅ Family member addition completed successfully');
      return result;
    } catch (error) {
      console.error('❌ Family member addition failed:', error);
      throw error;
    }
  }, [user, targetStudentId, addFamilyMemberMutation]);

  const updateFamilyMember = useCallback(async (id: string, updates: FamilyMemberUpdate) => {
    return updateFamilyMemberMutation.mutateAsync({ id, updates });
  }, [updateFamilyMemberMutation]);

  const deleteFamilyMember = useCallback(async (id: string) => {
    return deleteFamilyMemberMutation.mutateAsync(id);
  }, [deleteFamilyMemberMutation]);

  const sendInvitation = useCallback(async (familyMemberId: string, method: InviteMethod) => {
    return sendInvitationMutation.mutateAsync({ familyMemberId, method });
  }, [sendInvitationMutation]);

  // Combined loading state
  const isLoadingAny = isFetching || 
    addFamilyMemberMutation.isPending || 
    updateFamilyMemberMutation.isPending || 
    deleteFamilyMemberMutation.isPending ||
    sendInvitationMutation.isPending;

  // Combined error state
  const anyError = fetchError || 
    addFamilyMemberMutation.error || 
    updateFamilyMemberMutation.error || 
    deleteFamilyMemberMutation.error ||
    sendInvitationMutation.error;

  return {
    // Data
    familyMembers,
    
    // Loading states
    isLoading: isLoadingAny,
    isFetching,
    
    // Error states
    error: anyError,
    
    // Actions
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    sendInvitation,
    refetch,
    
    // Mutation states
    isAdding: addFamilyMemberMutation.isPending,
    isUpdating: updateFamilyMemberMutation.isPending,
    isDeleting: deleteFamilyMemberMutation.isPending,
    isSendingInvitation: sendInvitationMutation.isPending,
  };
};
