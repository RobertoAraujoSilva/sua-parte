import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreVertical, Mail, Phone, Edit, Trash2, Send, UserPlus } from 'lucide-react';
import {
  FamilyMemberWithInvitations,
  getRelationLabel,
  getGenderLabel,
  getInvitationStatusLabel,
  getInvitationStatusColor,
  getInvitationStatusIcon,
  InviteMethod,
  parseRelation,
  parseGender,
  parseInvitationStatus
} from '@/types/family';

interface FamilyMembersListProps {
  familyMembers: FamilyMemberWithInvitations[];
  onEdit: (familyMember: FamilyMemberWithInvitations) => void;
  onDelete: (id: string) => Promise<void>;
  onSendInvitation: (familyMemberId: string, method: InviteMethod) => Promise<void>;
  onAddNew: () => void;
  isLoading?: boolean;
}

export const FamilyMembersList: React.FC<FamilyMembersListProps> = ({
  familyMembers,
  onEdit,
  onDelete,
  onSendInvitation,
  onAddNew,
  isLoading = false
}) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<FamilyMemberWithInvitations | null>(null);
  const [loadingActions, setLoadingActions] = useState<Record<string, boolean>>({});

  const handleDeleteClick = (member: FamilyMemberWithInvitations) => {
    setMemberToDelete(member);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;

    setLoadingActions(prev => ({ ...prev, [`delete-${memberToDelete.id}`]: true }));
    
    try {
      await onDelete(memberToDelete.id);
      setDeleteDialogOpen(false);
      setMemberToDelete(null);
    } catch (error) {
      console.error('Error deleting family member:', error);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`delete-${memberToDelete.id}`]: false }));
    }
  };

  const handleSendInvitation = async (familyMemberId: string, method: InviteMethod) => {
    setLoadingActions(prev => ({ ...prev, [`invite-${familyMemberId}`]: true }));
    
    try {
      await onSendInvitation(familyMemberId, method);
    } catch (error) {
      console.error('Error sending invitation:', error);
    } finally {
      setLoadingActions(prev => ({ ...prev, [`invite-${familyMemberId}`]: false }));
    }
  };

  if (familyMembers.length === 0) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center space-y-4">
            <UserPlus className="mx-auto h-12 w-12 text-gray-400" />
            <div>
              <h3 className="text-lg font-medium text-gray-900">Nenhum familiar cadastrado</h3>
              <p className="text-gray-500 mt-1">
                Comece adicionando seus familiares para melhorar as designações da escola.
              </p>
            </div>
            <Button onClick={onAddNew} className="bg-jw-blue hover:bg-jw-blue/90">
              <UserPlus className="h-4 w-4 mr-2" />
              Adicionar Primeiro Familiar
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">
          Familiares Cadastrados ({familyMembers.length})
        </h3>
        <Button onClick={onAddNew} className="bg-jw-blue hover:bg-jw-blue/90">
          <UserPlus className="h-4 w-4 mr-2" />
          Adicionar Familiar
        </Button>
      </div>

      {/* Family Members Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {familyMembers.map((member) => (
          <Card key={member.id} className="relative">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <CardTitle className="text-base font-medium">
                    {member.name}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary" className="text-xs">
                      {getRelationLabel(parseRelation(member.relation))}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {getGenderLabel(parseGender(member.gender))}
                    </Badge>
                  </div>
                </div>
                
                {/* Actions Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => onEdit(member)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Editar
                    </DropdownMenuItem>
                    {member.can_invite && (
                      <>
                        {member.email && (
                          <DropdownMenuItem 
                            onClick={() => handleSendInvitation(member.id, 'EMAIL')}
                            disabled={loadingActions[`invite-${member.id}`]}
                          >
                            <Mail className="h-4 w-4 mr-2" />
                            Enviar por Email
                          </DropdownMenuItem>
                        )}
                        {member.phone && (
                          <DropdownMenuItem 
                            onClick={() => handleSendInvitation(member.id, 'WHATSAPP')}
                            disabled={loadingActions[`invite-${member.id}`]}
                          >
                            <Phone className="h-4 w-4 mr-2" />
                            Enviar por WhatsApp
                          </DropdownMenuItem>
                        )}
                      </>
                    )}
                    <DropdownMenuItem 
                      onClick={() => handleDeleteClick(member)}
                      className="text-red-600"
                      disabled={loadingActions[`delete-${member.id}`]}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remover
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="pt-0 space-y-3">
              {/* Contact Information */}
              <div className="space-y-1 text-sm text-gray-600">
                {member.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{member.email}</span>
                  </div>
                )}
                {member.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-3 w-3" />
                    <span>{member.phone}</span>
                  </div>
                )}
                {!member.email && !member.phone && (
                  <p className="text-gray-400 italic">Sem contato cadastrado</p>
                )}
              </div>

              {/* Invitation Status */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-xs">
                    {getInvitationStatusIcon(parseInvitationStatus(member.invitation_status))}
                  </span>
                  <Badge
                    variant="secondary"
                    className={`text-xs ${getInvitationStatusColor(parseInvitationStatus(member.invitation_status))}`}
                  >
                    {getInvitationStatusLabel(parseInvitationStatus(member.invitation_status))}
                  </Badge>
                </div>

                {/* Quick Invite Button */}
                {member.can_invite && member.invitation_status !== 'ACCEPTED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const method = member.email ? 'EMAIL' : 'WHATSAPP';
                      handleSendInvitation(member.id, method);
                    }}
                    disabled={loadingActions[`invite-${member.id}`]}
                    className="h-7 px-2 text-xs"
                  >
                    <Send className="h-3 w-3 mr-1" />
                    {loadingActions[`invite-${member.id}`] ? 'Enviando...' : 'Convidar'}
                  </Button>
                )}
              </div>

              {/* Latest Invitation Info */}
              {member.latest_invitation && (
                <div className="text-xs text-gray-500 pt-2 border-t">
                  Último convite: {new Date(member.latest_invitation.created_at).toLocaleDateString('pt-BR')}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Remoção</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover <strong>{memberToDelete?.name}</strong> da sua lista de familiares?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
              disabled={memberToDelete ? loadingActions[`delete-${memberToDelete.id}`] : false}
            >
              {memberToDelete && loadingActions[`delete-${memberToDelete.id}`] ? 'Removendo...' : 'Remover'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
