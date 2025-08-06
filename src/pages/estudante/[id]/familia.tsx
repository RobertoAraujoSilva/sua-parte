import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useFamilyMembers } from '@/hooks/useFamilyMembers';
import { FamilyMemberForm } from '@/components/FamilyMemberForm';
import { FamilyMembersList } from '@/components/FamilyMembersList';
import { 
  FamilyMemberFormData, 
  FamilyMemberWithInvitations,
  InviteMethod 
} from '@/types/family';

const FamiliaPage: React.FC = () => {
  const { id: studentId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'list' | 'add' | 'edit'>('list');
  const [editingMember, setEditingMember] = useState<FamilyMemberWithInvitations | null>(null);

  // Check if current user can manage this student's family
  const canManage = user?.id === studentId || user?.user_metadata?.role === 'instrutor';

  const {
    familyMembers,
    isLoading,
    isFetching,
    error,
    addFamilyMember,
    updateFamilyMember,
    deleteFamilyMember,
    sendInvitation,
    refetch,
    isAdding,
    isUpdating,
    isDeleting,
    isSendingInvitation
  } = useFamilyMembers(studentId);

  // Redirect if user doesn't have permission
  if (!canManage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-red-600">
                <Users className="h-12 w-12 mx-auto mb-4" />
              </div>
              <h2 className="text-xl font-semibold">Acesso Negado</h2>
              <p className="text-gray-600">
                Você não tem permissão para gerenciar os familiares deste estudante.
              </p>
              <Button onClick={() => navigate(-1)}>
                Voltar
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleAddMember = async (data: FamilyMemberFormData) => {
    try {
      await addFamilyMember(data);
      setActiveTab('list');
    } catch (error) {
      console.error('Error adding family member:', error);
      throw error;
    }
  };

  const handleUpdateMember = async (data: FamilyMemberFormData) => {
    if (!editingMember) return;

    try {
      await updateFamilyMember(editingMember.id, data);
      setEditingMember(null);
      setActiveTab('list');
    } catch (error) {
      console.error('Error updating family member:', error);
      throw error;
    }
  };

  const handleEditMember = (member: FamilyMemberWithInvitations) => {
    setEditingMember(member);
    setActiveTab('edit');
  };

  const handleDeleteMember = async (id: string) => {
    try {
      await deleteFamilyMember(id);
    } catch (error) {
      console.error('Error deleting family member:', error);
      throw error;
    }
  };

  const handleSendInvitation = async (familyMemberId: string, method: InviteMethod) => {
    try {
      await sendInvitation(familyMemberId, method);
    } catch (error) {
      console.error('Error sending invitation:', error);
      throw error;
    }
  };

  const handleCancel = () => {
    setEditingMember(null);
    setActiveTab('list');
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-red-600">
                <Users className="h-12 w-12 mx-auto mb-4" />
              </div>
              <h2 className="text-xl font-semibold">Erro ao Carregar</h2>
              <p className="text-gray-600">
                Não foi possível carregar os dados dos familiares.
              </p>
              <div className="space-x-2">
                <Button onClick={() => refetch()} variant="outline">
                  Tentar Novamente
                </Button>
                <Button onClick={() => navigate(-1)}>
                  Voltar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/estudante/${studentId}`)}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Portal
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gerenciar Família</h1>
              <p className="text-gray-600">
                Cadastre seus familiares para melhorar as designações da escola
              </p>
            </div>
          </div>
        </div>

        {/* Information Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <strong>Por que cadastrar familiares?</strong> O sistema utilizará essas informações para:
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Evitar designações inadequadas entre homens e mulheres não familiares</li>
              <li>Permitir que familiares acompanhem suas designações</li>
              <li>Seguir as diretrizes da S-38-T sobre pareamento familiar</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="list">Lista de Familiares</TabsTrigger>
            <TabsTrigger value="add">Adicionar Familiar</TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            <FamilyMembersList
              familyMembers={familyMembers}
              onEdit={handleEditMember}
              onDelete={handleDeleteMember}
              onSendInvitation={handleSendInvitation}
              onAddNew={() => setActiveTab('add')}
              isLoading={isFetching}
            />
          </TabsContent>

          <TabsContent value="add" className="space-y-4">
            <FamilyMemberForm
              onSubmit={handleAddMember}
              onCancel={handleCancel}
              isLoading={isAdding}
              title="Adicionar Familiar"
            />
          </TabsContent>

          <TabsContent value="edit" className="space-y-4">
            {editingMember && (
              <FamilyMemberForm
                onSubmit={handleUpdateMember}
                onCancel={handleCancel}
                initialData={editingMember}
                isLoading={isUpdating}
                title={`Editar ${editingMember.name}`}
              />
            )}
          </TabsContent>
        </Tabs>

        {/* Loading Overlay - Only show during mutations, not initial fetch */}
        {(isAdding || isUpdating || isDeleting || isSendingInvitation) && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <Card className="p-6">
              <div className="flex items-center space-x-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-jw-blue"></div>
                <p className="text-gray-600">
                  {isAdding && 'Adicionando familiar...'}
                  {isUpdating && 'Atualizando familiar...'}
                  {isDeleting && 'Removendo familiar...'}
                  {isSendingInvitation && 'Enviando convite...'}
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamiliaPage;
