export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      administrative_assignments: {
        Row: {
          assigned_room: string | null
          assignment_date: string
          created_at: string | null
          id: string
          id_estudante: string | null
          role: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_room?: string | null
          assignment_date: string
          created_at?: string | null
          id?: string
          id_estudante?: string | null
          role: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_room?: string | null
          assignment_date?: string
          created_at?: string | null
          id?: string
          id_estudante?: string | null
          role?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "administrative_assignments_id_estudante_fkey"
            columns: ["id_estudante"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
        ]
      }
      congregacoes: {
        Row: {
          cidade: string | null
          created_at: string | null
          endereco: string | null
          estado: string | null
          id: string
          nome: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cidade?: string | null
          created_at?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cidade?: string | null
          created_at?: string | null
          endereco?: string | null
          estado?: string | null
          id?: string
          nome?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      designacoes: {
        Row: {
          cena: string | null
          confirmado: boolean | null
          created_at: string | null
          data_designacao: string | null
          id: string
          id_ajudante: string | null
          id_estudante: string
          id_programa: string | null
          numero_parte: number | null
          tempo_minutos: number | null
          tipo_parte: string | null
          titulo_parte: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cena?: string | null
          confirmado?: boolean | null
          created_at?: string | null
          data_designacao?: string | null
          id?: string
          id_ajudante?: string | null
          id_estudante: string
          id_programa?: string | null
          numero_parte?: number | null
          tempo_minutos?: number | null
          tipo_parte?: string | null
          titulo_parte: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cena?: string | null
          confirmado?: boolean | null
          created_at?: string | null
          data_designacao?: string | null
          id?: string
          id_ajudante?: string | null
          id_estudante?: string
          id_programa?: string | null
          numero_parte?: number | null
          tempo_minutos?: number | null
          tipo_parte?: string | null
          titulo_parte?: string
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
          idade: number
          nome: string
          observacoes: string | null
          telefone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          cargo?: Database["public"]["Enums"]["app_cargo"]
          created_at?: string | null
          data_batismo?: string | null
          email?: string | null
          genero: Database["public"]["Enums"]["app_genero"]
          id?: string
          id_pai_mae?: string | null
          idade: number
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
          idade?: number
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
      family_members: {
        Row: {
          created_at: string | null
          email: string | null
          gender: string | null
          id: string
          invitation_status: string | null
          name: string
          phone: string | null
          relation: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          invitation_status?: string | null
          name: string
          phone?: string | null
          relation?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          invitation_status?: string | null
          name?: string
          phone?: string | null
          relation?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      meeting_parts: {
        Row: {
          assigned_student_id: string | null
          created_at: string | null
          duration_minutes: number | null
          helper_id: string | null
          id: string
          meeting_id: string | null
          part_number: number | null
          part_type: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_student_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          helper_id?: string | null
          id?: string
          meeting_id?: string | null
          part_number?: number | null
          part_type?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_student_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          helper_id?: string | null
          id?: string
          meeting_id?: string | null
          part_number?: number | null
          part_type?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_parts_assigned_student_id_fkey"
            columns: ["assigned_student_id"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_parts_helper_id_fkey"
            columns: ["helper_id"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_parts_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
      meetings: {
        Row: {
          created_at: string | null
          description: string | null
          event_details: Json | null
          id: string
          meeting_date: string
          meeting_flow: Json | null
          meeting_type: string
          start_time: string | null
          status: string | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          event_details?: Json | null
          id?: string
          meeting_date: string
          meeting_flow?: Json | null
          meeting_type: string
          start_time?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          event_details?: Json | null
          id?: string
          meeting_date?: string
          meeting_flow?: Json | null
          meeting_type?: string
          start_time?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          cargo: string | null
          congregacao: string | null
          created_at: string | null
          date_of_birth: string | null
          id: string
          nome_completo: string | null
          updated_at: string | null
        }
        Insert: {
          cargo?: string | null
          congregacao?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          id: string
          nome_completo?: string | null
          updated_at?: string | null
        }
        Update: {
          cargo?: string | null
          congregacao?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          nome_completo?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      programas: {
        Row: {
          assignment_status: string | null
          conteudo: Json | null
          created_at: string | null
          data: string
          data_inicio_semana: string | null
          id: string
          mes_apostila: string | null
          semana: string | null
          status: string | null
          titulo: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assignment_status?: string | null
          conteudo?: Json | null
          created_at?: string | null
          data: string
          data_inicio_semana?: string | null
          id?: string
          mes_apostila?: string | null
          semana?: string | null
          status?: string | null
          titulo: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assignment_status?: string | null
          conteudo?: Json | null
          created_at?: string | null
          data?: string
          data_inicio_semana?: string | null
          id?: string
          mes_apostila?: string | null
          semana?: string | null
          status?: string | null
          titulo?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          room_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          room_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          room_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      special_events: {
        Row: {
          cancel_midweek_meetings: boolean | null
          cancel_weekend_meetings: boolean | null
          created_at: string | null
          end_date: string | null
          event_name: string
          event_type: string | null
          id: string
          start_date: string
          study_materials: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_midweek_meetings?: boolean | null
          cancel_weekend_meetings?: boolean | null
          created_at?: string | null
          end_date?: string | null
          event_name: string
          event_type?: string | null
          id?: string
          start_date: string
          study_materials?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_midweek_meetings?: boolean | null
          cancel_weekend_meetings?: boolean | null
          created_at?: string | null
          end_date?: string | null
          event_name?: string
          event_type?: string | null
          id?: string
          start_date?: string
          study_materials?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      student_progress: {
        Row: {
          bible_reading: boolean | null
          bible_study: boolean | null
          can_be_helper: boolean | null
          can_teach_others: boolean | null
          created_at: string | null
          demonstration: boolean | null
          id: string
          initial_call: boolean | null
          instructor_feedback: string | null
          last_assignment_date: string | null
          performance_notes: string | null
          progress_level: Database["public"]["Enums"]["progress_level"]
          return_visit: boolean | null
          student_id: string
          talk: boolean | null
          total_assignments: number | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          bible_reading?: boolean | null
          bible_study?: boolean | null
          can_be_helper?: boolean | null
          can_teach_others?: boolean | null
          created_at?: string | null
          demonstration?: boolean | null
          id?: string
          initial_call?: boolean | null
          instructor_feedback?: string | null
          last_assignment_date?: string | null
          performance_notes?: string | null
          progress_level?: Database["public"]["Enums"]["progress_level"]
          return_visit?: boolean | null
          student_id: string
          talk?: boolean | null
          total_assignments?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          bible_reading?: boolean | null
          bible_study?: boolean | null
          can_be_helper?: boolean | null
          can_teach_others?: boolean | null
          created_at?: string | null
          demonstration?: boolean | null
          id?: string
          initial_call?: boolean | null
          instructor_feedback?: string | null
          last_assignment_date?: string | null
          performance_notes?: string | null
          progress_level?: Database["public"]["Enums"]["progress_level"]
          return_visit?: boolean | null
          student_id?: string
          talk?: boolean | null
          total_assignments?: number | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_progress_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
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
      app_role: "admin" | "instrutor" | "estudante" | "family_member"
      progress_level: "beginning" | "developing" | "qualified" | "advanced"
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
      app_role: ["admin", "instrutor", "estudante", "family_member"],
      progress_level: ["beginning", "developing", "qualified", "advanced"],
    },
  },
} as const
