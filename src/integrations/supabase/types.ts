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
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          cargo?: string | null
          congregacao?: string | null
          created_at?: string | null
          id: string
          nome_completo?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          cargo?: string | null
          congregacao?: string | null
          created_at?: string | null
          id?: string
          nome_completo?: string | null
          role?: Database["public"]["Enums"]["user_role"]
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
      meetings: {
        Row: {
          id: string
          user_id: string
          meeting_date: string
          meeting_type: Database["public"]["Enums"]["meeting_type"]
          status: Database["public"]["Enums"]["meeting_status"] | null
          title: string | null
          description: string | null
          start_time: string | null
          end_time: string | null
          circuit_overseer_name: string | null
          service_talk_title: string | null
          closing_song_number: number | null
          event_details: Json | null
          meeting_flow: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          meeting_date: string
          meeting_type: Database["public"]["Enums"]["meeting_type"]
          status?: Database["public"]["Enums"]["meeting_status"] | null
          title?: string | null
          description?: string | null
          start_time?: string | null
          end_time?: string | null
          circuit_overseer_name?: string | null
          service_talk_title?: string | null
          closing_song_number?: number | null
          event_details?: Json | null
          meeting_flow?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          meeting_date?: string
          meeting_type?: Database["public"]["Enums"]["meeting_type"]
          status?: Database["public"]["Enums"]["meeting_status"] | null
          title?: string | null
          description?: string | null
          start_time?: string | null
          end_time?: string | null
          circuit_overseer_name?: string | null
          service_talk_title?: string | null
          closing_song_number?: number | null
          event_details?: Json | null
          meeting_flow?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      administrative_assignments: {
        Row: {
          id: string
          user_id: string
          id_estudante: string
          role: Database["public"]["Enums"]["administrative_role"]
          assignment_date: string
          meeting_id: string | null
          start_date: string | null
          end_date: string | null
          is_recurring: boolean | null
          assigned_room: Database["public"]["Enums"]["room_type"] | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          id_estudante: string
          role: Database["public"]["Enums"]["administrative_role"]
          assignment_date: string
          meeting_id?: string | null
          start_date?: string | null
          end_date?: string | null
          is_recurring?: boolean | null
          assigned_room?: Database["public"]["Enums"]["room_type"] | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          id_estudante?: string
          role?: Database["public"]["Enums"]["administrative_role"]
          assignment_date?: string
          meeting_id?: string | null
          start_date?: string | null
          end_date?: string | null
          is_recurring?: boolean | null
          assigned_room?: Database["public"]["Enums"]["room_type"] | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      rooms: {
        Row: {
          id: string
          user_id: string
          room_name: string
          room_type: Database["public"]["Enums"]["room_type"]
          capacity: number | null
          equipment_available: string[] | null
          is_active: boolean | null
          current_overseer_id: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          room_name: string
          room_type: Database["public"]["Enums"]["room_type"]
          capacity?: number | null
          equipment_available?: string[] | null
          is_active?: boolean | null
          current_overseer_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          room_name?: string
          room_type?: Database["public"]["Enums"]["room_type"]
          capacity?: number | null
          equipment_available?: string[] | null
          is_active?: boolean | null
          current_overseer_id?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      special_events: {
        Row: {
          id: string
          user_id: string
          event_name: string
          event_type: string
          start_date: string
          end_date: string
          location: string | null
          theme: string | null
          special_instructions: string | null
          cancels_midweek_meetings: boolean | null
          cancels_weekend_meetings: boolean | null
          study_materials: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          event_name: string
          event_type: string
          start_date: string
          end_date: string
          location?: string | null
          theme?: string | null
          special_instructions?: string | null
          cancels_midweek_meetings?: boolean | null
          cancels_weekend_meetings?: boolean | null
          study_materials?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          event_name?: string
          event_type?: string
          start_date?: string
          end_date?: string
          location?: string | null
          theme?: string | null
          special_instructions?: string | null
          cancels_midweek_meetings?: boolean | null
          cancels_weekend_meetings?: boolean | null
          study_materials?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      meeting_parts: {
        Row: {
          id: string
          meeting_id: string
          part_number: number
          part_type: string
          title: string | null
          duration_minutes: number | null
          assigned_student_id: string | null
          assigned_helper_id: string | null
          assigned_room: Database["public"]["Enums"]["room_type"] | null
          source_material: string | null
          scene_setting: string | null
          special_instructions: string | null
          video_content_url: string | null
          video_start_time: number | null
          video_end_time: number | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          meeting_id: string
          part_number: number
          part_type: string
          title?: string | null
          duration_minutes?: number | null
          assigned_student_id?: string | null
          assigned_helper_id?: string | null
          assigned_room?: Database["public"]["Enums"]["room_type"] | null
          source_material?: string | null
          scene_setting?: string | null
          special_instructions?: string | null
          video_content_url?: string | null
          video_start_time?: number | null
          video_end_time?: number | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          meeting_id?: string
          part_number?: number
          part_type?: string
          title?: string | null
          duration_minutes?: number | null
          assigned_student_id?: string | null
          assigned_helper_id?: string | null
          assigned_room?: Database["public"]["Enums"]["room_type"] | null
          source_material?: string | null
          scene_setting?: string | null
          special_instructions?: string | null
          video_content_url?: string | null
          video_start_time?: number | null
          video_end_time?: number | null
          created_at?: string | null
          updated_at?: string | null
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
      administrative_role:
        | "meeting_overseer"
        | "meeting_chairman"
        | "assistant_counselor"
        | "room_overseer"
        | "circuit_overseer"
      app_cargo:
        | "anciao"
        | "servo_ministerial"
        | "pioneiro_regular"
        | "publicador_batizado"
        | "publicador_nao_batizado"
        | "estudante_novo"
      app_genero: "masculino" | "feminino"
      meeting_status: "scheduled" | "in_progress" | "completed" | "cancelled" | "postponed"
      meeting_type:
        | "regular_midweek"
        | "regular_weekend"
        | "circuit_overseer_visit"
        | "assembly_week"
        | "convention_week"
        | "memorial"
        | "special_event"
        | "cancelled"
      room_type: "main_hall" | "auxiliary_room_1" | "auxiliary_room_2" | "auxiliary_room_3"
      status_programa: "ativo" | "inativo" | "arquivado"
      user_role: "instrutor" | "estudante"
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
