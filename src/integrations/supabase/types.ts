export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      designacoes: {
        Row: {
          cena: string | null
          confirmado: boolean | null
          created_at: string | null
          id: string
          id_ajudante: string | null
          id_estudante: string | null
          id_programa: string | null
          numero_parte: number | null
          observacoes: string | null
          tempo_minutos: number | null
          tipo_parte: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cena?: string | null
          confirmado?: boolean | null
          created_at?: string | null
          id?: string
          id_ajudante?: string | null
          id_estudante?: string | null
          id_programa?: string | null
          numero_parte?: number | null
          observacoes?: string | null
          tempo_minutos?: number | null
          tipo_parte: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cena?: string | null
          confirmado?: boolean | null
          created_at?: string | null
          id?: string
          id_ajudante?: string | null
          id_estudante?: string | null
          id_programa?: string | null
          numero_parte?: number | null
          observacoes?: string | null
          tempo_minutos?: number | null
          tipo_parte?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "designacoes_id_ajudante_fkey"
            columns: ["id_ajudante"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designacoes_id_estudante_fkey"
            columns: ["id_estudante"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "designacoes_id_programa_fkey"
            columns: ["id_programa"]
            isOneToOne: false
            referencedRelation: "programas"
            referencedColumns: ["id"]
          },
        ]
      }
      estudantes: {
        Row: {
          ativo: boolean | null
          cargo: Database["public"]["Enums"]["app_cargo"]
          created_at: string | null
          data_batismo: string | null
          email: string | null
          genero: Database["public"]["Enums"]["app_genero"]
          id: string
          id_pai_mae: string | null
          idade: number | null
          nome: string
          observacoes: string | null
          telefone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          cargo: Database["public"]["Enums"]["app_cargo"]
          created_at?: string | null
          data_batismo?: string | null
          email?: string | null
          genero: Database["public"]["Enums"]["app_genero"]
          id?: string
          id_pai_mae?: string | null
          idade?: number | null
          nome: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          cargo?: Database["public"]["Enums"]["app_cargo"]
          created_at?: string | null
          data_batismo?: string | null
          email?: string | null
          genero?: Database["public"]["Enums"]["app_genero"]
          id?: string
          id_pai_mae?: string | null
          idade?: number | null
          nome?: string
          observacoes?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estudantes_id_pai_mae_fkey"
            columns: ["id_pai_mae"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
        ]
      }
      notificacoes: {
        Row: {
          created_at: string | null
          data_envio: string | null
          erro_detalhes: string | null
          id: string
          id_designacao: string | null
          id_estudante: string | null
          status_envio: string | null
          tipo_envio: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_envio?: string | null
          erro_detalhes?: string | null
          id?: string
          id_designacao?: string | null
          id_estudante?: string | null
          status_envio?: string | null
          tipo_envio?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_envio?: string | null
          erro_detalhes?: string | null
          id?: string
          id_designacao?: string | null
          id_estudante?: string | null
          status_envio?: string | null
          tipo_envio?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notificacoes_id_designacao_fkey"
            columns: ["id_designacao"]
            isOneToOne: false
            referencedRelation: "designacoes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notificacoes_id_estudante_fkey"
            columns: ["id_estudante"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          cargo: string | null
          congregacao: string | null
          created_at: string | null
          id: string
          nome_completo: string | null
          updated_at: string | null
        }
        Insert: {
          cargo?: string | null
          congregacao?: string | null
          created_at?: string | null
          id: string
          nome_completo?: string | null
          updated_at?: string | null
        }
        Update: {
          cargo?: string | null
          congregacao?: string | null
          created_at?: string | null
          id?: string
          nome_completo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      programas: {
        Row: {
          created_at: string | null
          data_inicio_semana: string
          id: string
          mes_apostila: string | null
          partes: Json
          status: Database["public"]["Enums"]["status_programa"] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          data_inicio_semana: string
          id?: string
          mes_apostila?: string | null
          partes: Json
          status?: Database["public"]["Enums"]["status_programa"] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          data_inicio_semana?: string
          id?: string
          mes_apostila?: string | null
          partes?: Json
          status?: Database["public"]["Enums"]["status_programa"] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      app_cargo:
        | "anciao"
        | "servo_ministerial"
        | "pioneiro_regular"
        | "publicador_batizado"
        | "publicador_nao_batizado"
        | "estudante_novo"
      app_genero: "masculino" | "feminino"
      status_programa: "ativo" | "inativo" | "arquivado"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_cargo: [
        "anciao",
        "servo_ministerial",
        "pioneiro_regular",
        "publicador_batizado",
        "publicador_nao_batizado",
        "estudante_novo",
      ],
      app_genero: ["masculino", "feminino"],
      status_programa: ["ativo", "inativo", "arquivado"],
    },
  },
} as const
