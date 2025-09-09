export interface Estudante {
  id: string;
  nome: string;
  sobrenome: string;
  congregacao_id?: string;
  ativo: boolean | null;
  created_at: string;
}