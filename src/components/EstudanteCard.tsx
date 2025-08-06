import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Edit, Trash2, User, Phone, Mail, Calendar, Users } from "lucide-react";
import {
  EstudanteWithParent,
  getCargoLabel,
  getGeneroLabel,
  getQualificacoes,
  isMinor,
} from "@/types/estudantes";

interface EstudanteCardProps {
  estudante: EstudanteWithParent;
  onEdit: (estudante: EstudanteWithParent) => void;
  onDelete: (id: string) => void;
  loading?: boolean;
}

const EstudanteCard = ({ estudante, onEdit, onDelete, loading = false }: EstudanteCardProps) => {
  const [deleteLoading, setDeleteLoading] = useState(false);

  const qualificacoes = getQualificacoes(estudante.cargo, estudante.genero, estudante.idade || 18);
  const isMenor = estudante.idade ? isMinor(estudante.idade) : false;

  const handleDelete = async () => {
    setDeleteLoading(true);
    await onDelete(estudante.id);
    setDeleteLoading(false);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Não informado";
    return new Date(dateString).toLocaleDateString("pt-BR");
  };

  return (
    <Card className="hover:shadow-lg transition-all duration-300 border-border/50 hover:border-jw-blue/30">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="w-4 h-4 text-jw-blue" />
              {estudante.nome}
            </CardTitle>
            <CardDescription className="flex items-center gap-4 mt-1">
              <span>{getCargoLabel(estudante.cargo)}</span>
              <span>•</span>
              <span>{getGeneroLabel(estudante.genero)}</span>
              {estudante.idade && (
                <>
                  <span>•</span>
                  <span>{estudante.idade} anos</span>
                </>
              )}
            </CardDescription>
          </div>
          <div className="flex flex-col gap-1">
            <Badge variant={estudante.ativo ? "default" : "secondary"}>
              {estudante.ativo ? "Ativo" : "Inativo"}
            </Badge>
            {isMenor && (
              <Badge variant="outline" className="text-xs">
                Menor
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-2">
          {estudante.email && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Mail className="w-4 h-4" />
              <span>{estudante.email}</span>
            </div>
          )}
          {estudante.telefone && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Phone className="w-4 h-4" />
              <span>{estudante.telefone}</span>
            </div>
          )}
          {estudante.data_batismo && (
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Calendar className="w-4 h-4" />
              <span>Batizado em {formatDate(estudante.data_batismo)}</span>
            </div>
          )}
        </div>

        {/* Parent/Children Information */}
        {(estudante.pai_mae || (estudante.filhos && estudante.filhos.length > 0)) && (
          <div className="space-y-2">
            {estudante.pai_mae && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>Responsável: {estudante.pai_mae.nome}</span>
              </div>
            )}
            {estudante.filhos && estudante.filhos.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Users className="w-4 h-4" />
                <span>
                  Responsável por: {estudante.filhos.map(f => f.nome).join(", ")}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Qualifications */}
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-600">Qualificações:</Label>
          <div className="flex flex-wrap gap-1">
            {qualificacoes.map((qual, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {qual}
              </Badge>
            ))}
          </div>
        </div>

        {/* Observations */}
        {estudante.observacoes && (
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-600">Observações:</Label>
            <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
              {estudante.observacoes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onEdit(estudante)}
            disabled={loading}
          >
            <Edit className="w-4 h-4 mr-1" />
            Editar
          </Button>
          
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                disabled={loading || deleteLoading}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                <AlertDialogDescription>
                  Tem certeza que deseja excluir o estudante <strong>{estudante.nome}</strong>?
                  {estudante.filhos && estudante.filhos.length > 0 && (
                    <span className="block mt-2 text-red-600">
                      ⚠️ Este estudante é responsável por menores e não pode ser excluído.
                    </span>
                  )}
                  <span className="block mt-2">
                    Esta ação não pode ser desfeita.
                  </span>
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleteLoading || (estudante.filhos && estudante.filhos.length > 0)}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {deleteLoading ? "Excluindo..." : "Excluir"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default EstudanteCard;
