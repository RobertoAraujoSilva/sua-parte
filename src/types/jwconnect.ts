export type ConnectProfileStatus = 'pending' | 'approved' | 'rejected' | 'suspended';
export type ConnectGender = 'masculino' | 'feminino';
export type ConnectSpiritualStatus =
  | 'batizado'
  | 'pioneiro_regular'
  | 'pioneiro_auxiliar'
  | 'estudante_avancado';
export type ConnectPhotoStatus = 'pending' | 'approved' | 'rejected';
export type ConnectReportCategory =
  | 'fake_profile'
  | 'harassment'
  | 'inappropriate_content'
  | 'not_jw'
  | 'other';
export type ConnectReportStatus = 'open' | 'reviewing' | 'resolved' | 'dismissed';

export interface ConnectProfile {
  id: string;
  user_id: string;
  apelido: string;
  data_nascimento: string;
  genero: ConnectGender;
  cidade: string | null;
  pais: string | null;
  congregacao: string | null;
  status_espiritual: ConnectSpiritualStatus;
  tempo_na_verdade_anos: number | null;
  idiomas: string[];
  disposto_mudar_cidade: boolean;
  disposto_mudar_pais: boolean;
  bio: string | null;
  status: ConnectProfileStatus;
  rejection_reason: string | null;
  approved_by: string | null;
  approved_at: string | null;
  consent_religious_data: boolean;
  code_of_conduct_accepted_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConnectPhoto {
  id: string;
  profile_id: string;
  storage_path: string;
  is_primary: boolean;
  moderation_status: ConnectPhotoStatus;
  moderation_note: string | null;
  created_at: string;
  updated_at: string;
}

export interface ConnectPreferences {
  id: string;
  profile_id: string;
  idade_min: number;
  idade_max: number;
  generos_interesse: string[];
  paises: string[];
  idiomas: string[];
  status_espiritual: string[];
  apenas_dispostos_mudar: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConnectMatch {
  id: string;
  profile_a: string;
  profile_b: string;
  status: 'active' | 'closed';
  created_at: string;
  updated_at: string;
}

export interface ConnectMessage {
  id: string;
  match_id: string;
  sender_profile_id: string;
  body: string;
  created_at: string;
  updated_at: string;
}

export interface ConnectReport {
  id: string;
  reporter_profile_id: string;
  reported_profile_id: string;
  category: ConnectReportCategory;
  description: string | null;
  status: ConnectReportStatus;
  moderator_id: string | null;
  resolution_note: string | null;
  resolved_at: string | null;
  created_at: string;
  updated_at: string;
}

export const SPIRITUAL_STATUSES: ConnectSpiritualStatus[] = [
  'batizado',
  'pioneiro_regular',
  'pioneiro_auxiliar',
  'estudante_avancado',
];

export const REPORT_CATEGORIES: ConnectReportCategory[] = [
  'fake_profile',
  'harassment',
  'inappropriate_content',
  'not_jw',
  'other',
];

export function calcAge(isoDate: string): number {
  const birth = new Date(isoDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}
