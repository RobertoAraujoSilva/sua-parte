import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Users } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface InvitationData {
  family_member_id: string;
  student_id: string;
  invited_by: string;
  family_member_name: string;
  relation: string;
  invitation_token: string;
}

const ConviteAceitar: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);

  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setError('Token de convite não encontrado na URL');
      setLoading(false);
      return;
    }

    handleInvitationAcceptance();
  }, [token]);

  const handleInvitationAcceptance = async () => {
    if (!token) return;

    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Processing invitation token:', token);

      // First, verify the invitation token exists and is valid
      const { data: invitation, error: invitationError } = await supabase
        .from('invitations_log')
        .select(`
          *,
          family_members (
            id,
            name,
            email,
            relation,
            student_id
          )
        `)
        .eq('invitation_token', token)
        .eq('invite_status', 'SENT')
        .gte('expires_at', new Date().toISOString())
        .single();

      if (invitationError || !invitation) {
        console.error('❌ Invalid or expired invitation:', invitationError);
        setError('Convite inválido ou expirado. Solicite um novo convite.');
        setLoading(false);
        return;
      }

      console.log('✅ Valid invitation found:', invitation);

      const familyMember = invitation.family_members;
      if (!familyMember) {
        setError('Dados do familiar não encontrados.');
        setLoading(false);
        return;
      }

      // Get current user session
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError) {
        console.error('❌ Error getting user session:', userError);
        setError('Erro ao verificar sessão do usuário.');
        setLoading(false);
        return;
      }

      if (user) {
        // User is already logged in, check if it's the right email
        if (user.email === familyMember.email) {
          // Correct user, proceed with acceptance
          await completeInvitationAcceptance(invitation.id, familyMember.id);
        } else {
          // Wrong user, need to sign out and sign in with correct email
          setError(`Você está logado com ${user.email}, mas o convite é para ${familyMember.email}. Faça logout e tente novamente.`);
          setLoading(false);
          return;
        }
      } else {
        // No user session, need to create account or sign in
        if (!familyMember.email) {
          setError('Email do familiar não encontrado.');
          setLoading(false);
          return;
        }

        // Check if user already exists
        const { data: existingUsers } = await supabase.auth.admin.listUsers();
        const existingUser = existingUsers.users?.find(u => u.email === familyMember.email);

        if (existingUser) {
          // User exists, redirect to login
          setInvitationData({
            family_member_id: familyMember.id,
            student_id: familyMember.student_id,
            invited_by: invitation.sent_by_student_id,
            family_member_name: familyMember.name,
            relation: familyMember.relation,
            invitation_token: token,
          });
          setError('Conta já existe. Faça login para aceitar o convite.');
          setLoading(false);
          return;
        }

        // Create new user account
        const { data: newUser, error: signUpError } = await supabase.auth.signUp({
          email: familyMember.email,
          password: generateTemporaryPassword(),
          options: {
            data: {
              family_member_id: familyMember.id,
              student_id: familyMember.student_id,
              name: familyMember.name,
              relation: familyMember.relation,
              role: 'family_member',
            },
          },
        });

        if (signUpError) {
          console.error('❌ Error creating user account:', signUpError);
          setError(`Erro ao criar conta: ${signUpError.message}`);
          setLoading(false);
          return;
        }

        console.log('✅ User account created:', newUser.user?.id);

        // Complete invitation acceptance
        await completeInvitationAcceptance(invitation.id, familyMember.id);
      }
    } catch (error) {
      console.error('❌ Exception during invitation acceptance:', error);
      setError('Erro inesperado ao processar convite. Tente novamente.');
      setLoading(false);
    }
  };

  const completeInvitationAcceptance = async (invitationId: string, familyMemberId: string) => {
    try {
      // Update invitation status to ACCEPTED
      const { error: updateInvitationError } = await supabase
        .from('invitations_log')
        .update({ invite_status: 'ACCEPTED' })
        .eq('id', invitationId);

      if (updateInvitationError) {
        console.error('❌ Error updating invitation status:', updateInvitationError);
        throw updateInvitationError;
      }

      // Update family member status to ACCEPTED
      const { error: updateFamilyError } = await supabase
        .from('family_members')
        .update({ invitation_status: 'ACCEPTED' })
        .eq('id', familyMemberId);

      if (updateFamilyError) {
        console.error('❌ Error updating family member status:', updateFamilyError);
        throw updateFamilyError;
      }

      console.log('✅ Invitation acceptance completed');
      setSuccess(true);
      setLoading(false);

      // Redirect to family member portal after 3 seconds
      setTimeout(() => {
        navigate('/portal-familiar');
      }, 3000);
    } catch (error) {
      console.error('❌ Error completing invitation acceptance:', error);
      setError('Erro ao finalizar aceitação do convite.');
      setLoading(false);
    }
  };

  const generateTemporaryPassword = (): string => {
    // Generate a secure temporary password
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  };

  const handleRetry = () => {
    setError(null);
    setLoading(true);
    handleInvitationAcceptance();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-jw-blue mx-auto" />
              <h2 className="text-xl font-semibold">Processando Convite</h2>
              <p className="text-gray-600">
                Aguarde enquanto verificamos e ativamos seu acesso...
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <CheckCircle className="h-12 w-12 text-green-600 mx-auto" />
              <h2 className="text-xl font-semibold text-green-800">Convite Aceito!</h2>
              <p className="text-gray-600">
                Seu acesso foi ativado com sucesso. Você será redirecionado para o portal familiar em alguns segundos.
              </p>
              <Button 
                onClick={() => navigate('/portal-familiar')}
                className="bg-jw-blue hover:bg-jw-blue/90"
              >
                Ir para Portal Familiar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="flex items-center text-red-600">
              <XCircle className="h-6 w-6 mr-2" />
              Erro no Convite
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Button onClick={handleRetry} variant="outline" className="w-full">
                Tentar Novamente
              </Button>
              <Button 
                onClick={() => navigate('/')} 
                variant="ghost" 
                className="w-full"
              >
                Voltar ao Início
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default ConviteAceitar;
