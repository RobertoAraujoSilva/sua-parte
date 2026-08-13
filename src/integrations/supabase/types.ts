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
      connect_matches: {
        Row: {
          created_at: string
          id: string
          profile_a: string
          profile_b: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_a: string
          profile_b: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_a?: string
          profile_b?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connect_matches_profile_a_fkey"
            columns: ["profile_a"]
            isOneToOne: false
            referencedRelation: "connect_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connect_matches_profile_b_fkey"
            columns: ["profile_b"]
            isOneToOne: false
            referencedRelation: "connect_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      connect_messages: {
        Row: {
          body: string
          created_at: string
          id: string
          match_id: string
          sender_profile_id: string
          updated_at: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          match_id: string
          sender_profile_id: string
          updated_at?: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          match_id?: string
          sender_profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connect_messages_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "connect_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connect_messages_sender_profile_id_fkey"
            columns: ["sender_profile_id"]
            isOneToOne: false
            referencedRelation: "connect_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      connect_moderators: {
        Row: {
          created_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          user_id?: string
        }
        Relationships: []
      }
      connect_photos: {
        Row: {
          created_at: string
          id: string
          is_primary: boolean
          moderation_note: string | null
          moderation_status: string
          profile_id: string
          storage_path: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_primary?: boolean
          moderation_note?: string | null
          moderation_status?: string
          profile_id: string
          storage_path: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_primary?: boolean
          moderation_note?: string | null
          moderation_status?: string
          profile_id?: string
          storage_path?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connect_photos_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "connect_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      connect_preferences: {
        Row: {
          apenas_dispostos_mudar: boolean
          created_at: string
          generos_interesse: string[]
          id: string
          idade_max: number
          idade_min: number
          idiomas: string[]
          paises: string[]
          profile_id: string
          status_espiritual: string[]
          updated_at: string
        }
        Insert: {
          apenas_dispostos_mudar?: boolean
          created_at?: string
          generos_interesse?: string[]
          id?: string
          idade_max?: number
          idade_min?: number
          idiomas?: string[]
          paises?: string[]
          profile_id: string
          status_espiritual?: string[]
          updated_at?: string
        }
        Update: {
          apenas_dispostos_mudar?: boolean
          created_at?: string
          generos_interesse?: string[]
          id?: string
          idade_max?: number
          idade_min?: number
          idiomas?: string[]
          paises?: string[]
          profile_id?: string
          status_espiritual?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connect_preferences_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "connect_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      connect_profiles: {
        Row: {
          apelido: string
          approved_at: string | null
          approved_by: string | null
          bio: string | null
          cidade: string | null
          code_of_conduct_accepted_at: string | null
          congregacao: string | null
          consent_religious_data: boolean
          created_at: string
          data_nascimento: string
          disposto_mudar_cidade: boolean
          disposto_mudar_pais: boolean
          genero: string
          id: string
          idiomas: string[]
          pais: string | null
          rejection_reason: string | null
          status: string
          status_espiritual: string
          tempo_na_verdade_anos: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          apelido: string
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          cidade?: string | null
          code_of_conduct_accepted_at?: string | null
          congregacao?: string | null
          consent_religious_data?: boolean
          created_at?: string
          data_nascimento: string
          disposto_mudar_cidade?: boolean
          disposto_mudar_pais?: boolean
          genero: string
          id?: string
          idiomas?: string[]
          pais?: string | null
          rejection_reason?: string | null
          status?: string
          status_espiritual: string
          tempo_na_verdade_anos?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          apelido?: string
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          cidade?: string | null
          code_of_conduct_accepted_at?: string | null
          congregacao?: string | null
          consent_religious_data?: boolean
          created_at?: string
          data_nascimento?: string
          disposto_mudar_cidade?: boolean
          disposto_mudar_pais?: boolean
          genero?: string
          id?: string
          idiomas?: string[]
          pais?: string | null
          rejection_reason?: string | null
          status?: string
          status_espiritual?: string
          tempo_na_verdade_anos?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      connect_reports: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          moderator_id: string | null
          reported_profile_id: string
          reporter_profile_id: string
          resolution_note: string | null
          resolved_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description?: string | null
          id?: string
          moderator_id?: string | null
          reported_profile_id: string
          reporter_profile_id: string
          resolution_note?: string | null
          resolved_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          moderator_id?: string | null
          reported_profile_id?: string
          reporter_profile_id?: string
          resolution_note?: string | null
          resolved_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connect_reports_reported_profile_id_fkey"
            columns: ["reported_profile_id"]
            isOneToOne: false
            referencedRelation: "connect_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connect_reports_reporter_profile_id_fkey"
            columns: ["reporter_profile_id"]
            isOneToOne: false
            referencedRelation: "connect_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      connect_swipes: {
        Row: {
          created_at: string
          direction: string
          id: string
          swiper_profile_id: string
          target_profile_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          direction: string
          id?: string
          swiper_profile_id: string
          target_profile_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          direction?: string
          id?: string
          swiper_profile_id?: string
          target_profile_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "connect_swipes_swiper_profile_id_fkey"
            columns: ["swiper_profile_id"]
            isOneToOne: false
            referencedRelation: "connect_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connect_swipes_target_profile_id_fkey"
            columns: ["target_profile_id"]
            isOneToOne: false
            referencedRelation: "connect_profiles"
            referencedColumns: ["id"]
          },
        ]
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
          coabitacao: boolean | null
          created_at: string | null
          data_batismo: string | null
          data_nascimento: string | null
          email: string | null
          estado_civil: Database["public"]["Enums"]["estado_civil_type"] | null
          familia: string | null
          family_id: string | null
          genero: Database["public"]["Enums"]["app_genero"]
          id: string
          id_conjuge: string | null
          id_mae: string | null
          id_pai_mae: string | null
          idade: number
          menor: boolean | null
          nome: string
          observacoes: string | null
          papel_familiar:
            | Database["public"]["Enums"]["papel_familiar_type"]
            | null
          q_chairman: boolean | null
          q_explaining: boolean | null
          q_following: boolean | null
          q_gems: boolean | null
          q_living: boolean | null
          q_making: boolean | null
          q_pray: boolean | null
          q_reading: boolean | null
          q_starting: boolean | null
          q_talk: boolean | null
          q_treasures: boolean | null
          responsavel_primario: string | null
          responsavel_secundario: string | null
          telefone: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          ativo?: boolean | null
          cargo?: Database["public"]["Enums"]["app_cargo"]
          coabitacao?: boolean | null
          created_at?: string | null
          data_batismo?: string | null
          data_nascimento?: string | null
          email?: string | null
          estado_civil?: Database["public"]["Enums"]["estado_civil_type"] | null
          familia?: string | null
          family_id?: string | null
          genero: Database["public"]["Enums"]["app_genero"]
          id?: string
          id_conjuge?: string | null
          id_mae?: string | null
          id_pai_mae?: string | null
          idade: number
          menor?: boolean | null
          nome: string
          observacoes?: string | null
          papel_familiar?:
            | Database["public"]["Enums"]["papel_familiar_type"]
            | null
          q_chairman?: boolean | null
          q_explaining?: boolean | null
          q_following?: boolean | null
          q_gems?: boolean | null
          q_living?: boolean | null
          q_making?: boolean | null
          q_pray?: boolean | null
          q_reading?: boolean | null
          q_starting?: boolean | null
          q_talk?: boolean | null
          q_treasures?: boolean | null
          responsavel_primario?: string | null
          responsavel_secundario?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          ativo?: boolean | null
          cargo?: Database["public"]["Enums"]["app_cargo"]
          coabitacao?: boolean | null
          created_at?: string | null
          data_batismo?: string | null
          data_nascimento?: string | null
          email?: string | null
          estado_civil?: Database["public"]["Enums"]["estado_civil_type"] | null
          familia?: string | null
          family_id?: string | null
          genero?: Database["public"]["Enums"]["app_genero"]
          id?: string
          id_conjuge?: string | null
          id_mae?: string | null
          id_pai_mae?: string | null
          idade?: number
          menor?: boolean | null
          nome?: string
          observacoes?: string | null
          papel_familiar?:
            | Database["public"]["Enums"]["papel_familiar_type"]
            | null
          q_chairman?: boolean | null
          q_explaining?: boolean | null
          q_following?: boolean | null
          q_gems?: boolean | null
          q_living?: boolean | null
          q_making?: boolean | null
          q_pray?: boolean | null
          q_reading?: boolean | null
          q_starting?: boolean | null
          q_talk?: boolean | null
          q_treasures?: boolean | null
          responsavel_primario?: string | null
          responsavel_secundario?: string | null
          telefone?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "estudantes_id_conjuge_fkey"
            columns: ["id_conjuge"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estudantes_id_mae_fkey"
            columns: ["id_mae"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estudantes_id_pai_mae_fkey"
            columns: ["id_pai_mae"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estudantes_responsavel_primario_fkey"
            columns: ["responsavel_primario"]
            isOneToOne: false
            referencedRelation: "estudantes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "estudantes_responsavel_secundario_fkey"
            columns: ["responsavel_secundario"]
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
          invitation_token: string | null
          name: string
          phone: string | null
          relation: string | null
          student_id: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          invitation_status?: string | null
          invitation_token?: string | null
          name: string
          phone?: string | null
          relation?: string | null
          student_id?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          email?: string | null
          gender?: string | null
          id?: string
          invitation_status?: string | null
          invitation_token?: string | null
          name?: string
          phone?: string | null
          relation?: string | null
          student_id?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      invitations_log: {
        Row: {
          created_at: string | null
          expires_at: string
          family_member_id: string
          id: string
          invitation_token: string
          invite_method: string | null
          invite_status: string | null
          sent_by_student_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          expires_at?: string
          family_member_id: string
          id?: string
          invitation_token?: string
          invite_method?: string | null
          invite_status?: string | null
          sent_by_student_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          expires_at?: string
          family_member_id?: string
          id?: string
          invitation_token?: string
          invite_method?: string | null
          invite_status?: string | null
          sent_by_student_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitations_log_family_member_id_fkey"
            columns: ["family_member_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
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
      can_form_pair: {
        Args: { p_student1_id: string; p_student2_id: string }
        Returns: Json
      }
      can_receive_part: {
        Args: { p_part_type: string; p_student_id: string }
        Returns: boolean
      }
      check_student_duplicate: {
        Args: {
          p_email: string
          p_nome: string
          p_telefone: string
          p_user_id: string
        }
        Returns: boolean
      }
      connect_in_match: { Args: { _match_id: string }; Returns: boolean }
      connect_is_approved: { Args: { _user_id?: string }; Returns: boolean }
      connect_my_profile_id: { Args: never; Returns: string }
      connect_profile_is_approved: {
        Args: { _profile_id: string }
        Returns: boolean
      }
      connect_profile_status_unchanged: {
        Args: {
          _approved_at: string
          _approved_by: string
          _id: string
          _status: string
        }
        Returns: boolean
      }
      current_user_verified_email: { Args: never; Returns: string }
      family_member_email_is_unique: {
        Args: { _email: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_connect_moderator: { Args: { _user_id?: string }; Returns: boolean }
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
      estado_civil_type:
        | "solteiro"
        | "casado"
        | "divorciado"
        | "viuvo"
        | "separado"
      papel_familiar_type:
        | "pai"
        | "mae"
        | "filho"
        | "filha"
        | "avo"
        | "avo_f"
        | "tio"
        | "tia"
        | "sobrinho"
        | "sobrinha"
        | "primo"
        | "prima"
        | "outro"
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
      estado_civil_type: [
        "solteiro",
        "casado",
        "divorciado",
        "viuvo",
        "separado",
      ],
      papel_familiar_type: [
        "pai",
        "mae",
        "filho",
        "filha",
        "avo",
        "avo_f",
        "tio",
        "tia",
        "sobrinho",
        "sobrinha",
        "primo",
        "prima",
        "outro",
      ],
      progress_level: ["beginning", "developing", "qualified", "advanced"],
    },
  },
} as const
