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
      administrative_assignments: {
        Row: {
          assigned_room: Database["public"]["Enums"]["room_type"] | null
          assignment_date: string
          created_at: string | null
          id: string
          id_estudante: string | null
          is_substitute: boolean | null
          meeting_id: string | null
          role: Database["public"]["Enums"]["administrative_role"]
          special_instructions: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assigned_room?: Database["public"]["Enums"]["room_type"] | null
          assignment_date: string
          created_at?: string | null
          id?: string
          id_estudante?: string | null
          is_substitute?: boolean | null
          meeting_id?: string | null
          role: Database["public"]["Enums"]["administrative_role"]
          special_instructions?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assigned_room?: Database["public"]["Enums"]["room_type"] | null
          assignment_date?: string
          created_at?: string | null
          id?: string
          id_estudante?: string | null
          is_substitute?: boolean | null
          meeting_id?: string | null
          role?: Database["public"]["Enums"]["administrative_role"]
          special_instructions?: string | null
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
          {
            foreignKeyName: "administrative_assignments_meeting_id_fkey"
            columns: ["meeting_id"]
            isOneToOne: false
            referencedRelation: "meetings"
            referencedColumns: ["id"]
          },
        ]
      }
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
          titulo_parte: string | null
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
          titulo_parte?: string | null
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
          titulo_parte?: string | null
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
      family_members: {
        Row: {
          created_at: string | null
          email: string | null
          gender: string
          id: string
          invitation_status: string | null
          name: string
          phone: string | null
          relation: string
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          gender: string
          id?: string
          invitation_status?: string | null
          name: string
          phone?: string | null
          relation: string
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          gender?: string
          id?: string
          invitation_status?: string | null
          name?: string
          phone?: string | null
          relation?: string
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "family_members_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invitations_log: {
        Row: {
          created_at: string | null
          expires_at: string | null
          family_member_id: string | null
          id: string
          invitation_token: string | null
          invite_method: string
          invite_status: string | null
          sent_by_student_id: string | null
        }
        Insert: {
          created_at?: string | null
          expires_at?: string | null
          family_member_id?: string | null
          id?: string
          invitation_token?: string | null
          invite_method: string
          invite_status?: string | null
          sent_by_student_id?: string | null
        }
        Update: {
          created_at?: string | null
          expires_at?: string | null
          family_member_id?: string | null
          id?: string
          invitation_token?: string | null
          invite_method?: string
          invite_status?: string | null
          sent_by_student_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invitations_log_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invitations_log_sent_by_student_id_fkey"
            columns: ["sent_by_student_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      meeting_parts: {
        Row: {
          assigned_helper_id: string | null
          assigned_room: Database["public"]["Enums"]["room_type"] | null
          assigned_student_id: string | null
          created_at: string | null
          duration_minutes: number | null
          id: string
          meeting_id: string
          part_number: number
          part_type: string
          scene_setting: string | null
          source_material: string | null
          special_instructions: string | null
          title: string | null
          updated_at: string | null
          video_content_url: string | null
          video_end_time: number | null
          video_start_time: number | null
        }
        Insert: {
          assigned_helper_id?: string | null
          assigned_room?: Database["public"]["Enums"]["room_type"] | null
          assigned_student_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_id: string
          part_number: number
          part_type: string
          scene_setting?: string | null
          source_material?: string | null
          special_instructions?: string | null
          title?: string | null
          updated_at?: string | null
          video_content_url?: string | null
          video_end_time?: number | null
          video_start_time?: number | null
        }
        Update: {
          assigned_helper_id?: string | null
          assigned_room?: Database["public"]["Enums"]["room_type"] | null
          assigned_student_id?: string | null
          created_at?: string | null
          duration_minutes?: number | null
          id?: string
          meeting_id?: string
          part_number?: number
          part_type?: string
          scene_setting?: string | null
          source_material?: string | null
          special_instructions?: string | null
          title?: string | null
          updated_at?: string | null
          video_content_url?: string | null
          video_end_time?: number | null
          video_start_time?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meeting_parts_assigned_helper_id_fkey"
            columns: ["assigned_helper_id"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meeting_parts_assigned_student_id_fkey"
            columns: ["assigned_student_id"]
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
          circuit_overseer_name: string | null
          closing_song_number: number | null
          created_at: string | null
          description: string | null
          end_time: string | null
          event_details: Json | null
          id: string
          meeting_date: string
          meeting_flow: Json | null
          meeting_type: Database["public"]["Enums"]["meeting_type"]
          service_talk_title: string | null
          start_time: string | null
          status: Database["public"]["Enums"]["meeting_status"] | null
          title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          circuit_overseer_name?: string | null
          closing_song_number?: number | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_details?: Json | null
          id?: string
          meeting_date: string
          meeting_flow?: Json | null
          meeting_type: Database["public"]["Enums"]["meeting_type"]
          service_talk_title?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["meeting_status"] | null
          title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          circuit_overseer_name?: string | null
          closing_song_number?: number | null
          created_at?: string | null
          description?: string | null
          end_time?: string | null
          event_details?: Json | null
          id?: string
          meeting_date?: string
          meeting_flow?: Json | null
          meeting_type?: Database["public"]["Enums"]["meeting_type"]
          service_talk_title?: string | null
          start_time?: string | null
          status?: Database["public"]["Enums"]["meeting_status"] | null
          title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
          date_of_birth: string | null
          id: string
          nome_completo: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          cargo?: string | null
          congregacao?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          id: string
          nome_completo?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          cargo?: string | null
          congregacao?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          nome_completo?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      programas: {
        Row: {
          arquivo: string
          assignment_generation_error: string | null
          assignment_status: string | null
          assignments_generated_at: string | null
          created_at: string | null
          data_inicio_semana: string
          developer_processed_at: string | null
          developer_user_id: string | null
          id: string
          jw_org_content: string | null
          mes_apostila: string | null
          parsed_meeting_parts: Json | null
          partes: Json
          processing_notes: string | null
          semana: string
          status: Database["public"]["Enums"]["status_programa"] | null
          template_download_url: string | null
          template_metadata: Json | null
          template_status_enum:
            | Database["public"]["Enums"]["template_status"]
            | null
          total_assignments_generated: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          arquivo: string
          assignment_generation_error?: string | null
          assignment_status?: string | null
          assignments_generated_at?: string | null
          created_at?: string | null
          data_inicio_semana: string
          developer_processed_at?: string | null
          developer_user_id?: string | null
          id?: string
          jw_org_content?: string | null
          mes_apostila?: string | null
          parsed_meeting_parts?: Json | null
          partes: Json
          processing_notes?: string | null
          semana: string
          status?: Database["public"]["Enums"]["status_programa"] | null
          template_download_url?: string | null
          template_metadata?: Json | null
          template_status_enum?:
            | Database["public"]["Enums"]["template_status"]
            | null
          total_assignments_generated?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          arquivo?: string
          assignment_generation_error?: string | null
          assignment_status?: string | null
          assignments_generated_at?: string | null
          created_at?: string | null
          data_inicio_semana?: string
          developer_processed_at?: string | null
          developer_user_id?: string | null
          id?: string
          jw_org_content?: string | null
          mes_apostila?: string | null
          parsed_meeting_parts?: Json | null
          partes?: Json
          processing_notes?: string | null
          semana?: string
          status?: Database["public"]["Enums"]["status_programa"] | null
          template_download_url?: string | null
          template_metadata?: Json | null
          template_status_enum?:
            | Database["public"]["Enums"]["template_status"]
            | null
          total_assignments_generated?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      rooms: {
        Row: {
          capacity: number | null
          created_at: string | null
          current_overseer_id: string | null
          equipment_available: string[] | null
          id: string
          is_active: boolean | null
          room_name: string
          room_type: Database["public"]["Enums"]["room_type"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string | null
          current_overseer_id?: string | null
          equipment_available?: string[] | null
          id?: string
          is_active?: boolean | null
          room_name: string
          room_type: Database["public"]["Enums"]["room_type"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          capacity?: number | null
          created_at?: string | null
          current_overseer_id?: string | null
          equipment_available?: string[] | null
          id?: string
          is_active?: boolean | null
          room_name?: string
          room_type?: Database["public"]["Enums"]["room_type"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rooms_current_overseer_id_fkey"
            columns: ["current_overseer_id"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
        ]
      }
      special_events: {
        Row: {
          cancels_midweek_meetings: boolean | null
          cancels_weekend_meetings: boolean | null
          created_at: string | null
          end_date: string
          event_name: string
          event_type: string
          id: string
          location: string | null
          special_instructions: string | null
          start_date: string
          study_materials: Json | null
          theme: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancels_midweek_meetings?: boolean | null
          cancels_weekend_meetings?: boolean | null
          created_at?: string | null
          end_date: string
          event_name: string
          event_type: string
          id?: string
          location?: string | null
          special_instructions?: string | null
          start_date: string
          study_materials?: Json | null
          theme?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancels_midweek_meetings?: boolean | null
          cancels_weekend_meetings?: boolean | null
          created_at?: string | null
          end_date?: string
          event_name?: string
          event_type?: string
          id?: string
          location?: string | null
          special_instructions?: string | null
          start_date?: string
          study_materials?: Json | null
          theme?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      template_downloads: {
        Row: {
          created_at: string | null
          download_metadata: Json | null
          downloaded_at: string | null
          id: string
          instructor_user_id: string
          programa_id: string
          template_version: string | null
        }
        Insert: {
          created_at?: string | null
          download_metadata?: Json | null
          downloaded_at?: string | null
          id?: string
          instructor_user_id: string
          programa_id: string
          template_version?: string | null
        }
        Update: {
          created_at?: string | null
          download_metadata?: Json | null
          downloaded_at?: string | null
          id?: string
          instructor_user_id?: string
          programa_id?: string
          template_version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "template_downloads_programa_id_fkey"
            columns: ["programa_id"]
            isOneToOne: false
            referencedRelation: "programas"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_programa_duplicate: {
        Args: {
          p_user_id: string
          p_mes_apostila: string
          p_data_inicio_semana: string
        }
        Returns: boolean
      }
      check_student_duplicate: {
        Args: {
          p_user_id: string
          p_nome: string
          p_email: string
          p_telefone: string
        }
        Returns: boolean
      }
      debug_auth_access: {
        Args: Record<PropertyKey, never>
        Returns: {
          current_user_id: string
          auth_role: string
          profile_exists: boolean
          profile_data: Json
        }[]
      }
      get_current_user_profile: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          nome_completo: string
          congregacao: string
          cargo: string
          role: Database["public"]["Enums"]["user_role"]
          email: string
          created_at: string
          updated_at: string
        }[]
      }
      get_programs_complete: {
        Args: { user_uuid: string }
        Returns: {
          id: string
          user_id: string
          data_inicio_semana: string
          mes_apostila: string
          semana: string
          arquivo: string
          partes: Json
          status: Database["public"]["Enums"]["status_programa"]
          assignment_status: string
          assignments_generated_at: string
          total_assignments_generated: number
          created_at: string
          updated_at: string
        }[]
      }
      get_user_profile: {
        Args: { user_id?: string }
        Returns: {
          id: string
          nome_completo: string
          congregacao: string
          cargo: string
          role: Database["public"]["Enums"]["user_role"]
          date_of_birth: string
          email: string
          created_at: string
          updated_at: string
        }[]
      }
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
      assignment_status:
        | "pending"
        | "in_progress"
        | "generating"
        | "generated"
        | "approved"
        | "rejected"
      meeting_status:
        | "scheduled"
        | "in_progress"
        | "completed"
        | "cancelled"
        | "postponed"
      meeting_type:
        | "regular_midweek"
        | "regular_weekend"
        | "circuit_overseer_visit"
        | "assembly_week"
        | "convention_week"
        | "memorial"
        | "special_event"
        | "cancelled"
      room_type:
        | "main_hall"
        | "auxiliary_room_1"
        | "auxiliary_room_2"
        | "auxiliary_room_3"
      status_programa: "ativo" | "inativo" | "arquivado" | "aprovado"
      template_status:
        | "pending"
        | "processing"
        | "template_ready"
        | "published"
        | "archived"
      user_role: "instrutor" | "estudante" | "family_member" | "developer" | "admin"
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
      administrative_role: [
        "meeting_overseer",
        "meeting_chairman",
        "assistant_counselor",
        "room_overseer",
        "circuit_overseer",
      ],
      app_cargo: [
        "anciao",
        "servo_ministerial",
        "pioneiro_regular",
        "publicador_batizado",
        "publicador_nao_batizado",
        "estudante_novo",
      ],
      app_genero: ["masculino", "feminino"],
      assignment_status: [
        "pending",
        "in_progress",
        "generating",
        "generated",
        "approved",
        "rejected",
      ],
      meeting_status: [
        "scheduled",
        "in_progress",
        "completed",
        "cancelled",
        "postponed",
      ],
      meeting_type: [
        "regular_midweek",
        "regular_weekend",
        "circuit_overseer_visit",
        "assembly_week",
        "convention_week",
        "memorial",
        "special_event",
        "cancelled",
      ],
      room_type: [
        "main_hall",
        "auxiliary_room_1",
        "auxiliary_room_2",
        "auxiliary_room_3",
      ],
      status_programa: ["ativo", "inativo", "arquivado", "aprovado"],
      template_status: [
        "pending",
        "processing",
        "template_ready",
        "published",
        "archived",
      ],
      user_role: ["instrutor", "estudante", "family_member", "developer"],
    },
  },
} as const
