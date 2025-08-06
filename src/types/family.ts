import { Database } from '@/integrations/supabase/types';

// Database types
export type FamilyMember = Database['public']['Tables']['family_members']['Row'];
export type FamilyMemberInsert = Database['public']['Tables']['family_members']['Insert'];
export type FamilyMemberUpdate = Database['public']['Tables']['family_members']['Update'];

export type InvitationLog = Database['public']['Tables']['invitations_log']['Row'];
export type InvitationLogInsert = Database['public']['Tables']['invitations_log']['Insert'];

// Enums
export type Gender = 'M' | 'F';
export type Relation = 'Pai' | 'Mãe' | 'Cônjuge' | 'Filho' | 'Filha' | 'Irmão' | 'Irmã';
export type InvitationStatus = 'PENDING' | 'SENT' | 'ACCEPTED' | 'EXPIRED';
export type InviteMethod = 'EMAIL' | 'WHATSAPP';

// Form types
export interface FamilyMemberFormData {
  name: string;
  email?: string;
  phone?: string;
  gender: Gender;
  relation: Relation;
}

// Display types
export interface FamilyMemberWithInvitations extends FamilyMember {
  latest_invitation?: InvitationLog;
  can_invite: boolean;
}

// Validation schemas
export const relationOptions: { value: Relation; label: string; gender?: Gender }[] = [
  { value: 'Pai', label: 'Pai', gender: 'M' },
  { value: 'Mãe', label: 'Mãe', gender: 'F' },
  { value: 'Cônjuge', label: 'Cônjuge' },
  { value: 'Filho', label: 'Filho', gender: 'M' },
  { value: 'Filha', label: 'Filha', gender: 'F' },
  { value: 'Irmão', label: 'Irmão', gender: 'M' },
  { value: 'Irmã', label: 'Irmã', gender: 'F' },
];

export const genderOptions: { value: Gender; label: string }[] = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Feminino' },
];

// Helper functions
export const getRelationLabel = (relation: Relation): string => {
  const option = relationOptions.find(opt => opt.value === relation);
  return option?.label || relation;
};

export const getGenderLabel = (gender: Gender): string => {
  const option = genderOptions.find(opt => opt.value === gender);
  return option?.label || gender;
};

export const getInvitationStatusLabel = (status: InvitationStatus): string => {
  const statusLabels: Record<InvitationStatus, string> = {
    PENDING: 'Pendente',
    SENT: 'Enviado',
    ACCEPTED: 'Aceito',
    EXPIRED: 'Expirado',
  };
  return statusLabels[status];
};

export const getInvitationStatusColor = (status: InvitationStatus): string => {
  const statusColors: Record<InvitationStatus, string> = {
    PENDING: 'text-yellow-600 bg-yellow-50',
    SENT: 'text-blue-600 bg-blue-50',
    ACCEPTED: 'text-green-600 bg-green-50',
    EXPIRED: 'text-red-600 bg-red-50',
  };
  return statusColors[status];
};

export const getInvitationStatusIcon = (status: InvitationStatus): string => {
  const statusIcons: Record<InvitationStatus, string> = {
    PENDING: '🟡',
    SENT: '🔵',
    ACCEPTED: '🟢',
    EXPIRED: '🔴',
  };
  return statusIcons[status];
};

// Phone validation and formatting helpers
export type PhoneCountry = 'BR' | 'UK' | 'UNKNOWN';

export const detectPhoneCountry = (phone: string): PhoneCountry => {
  const cleanPhone = phone.replace(/\D/g, '');

  // UK phone detection - International format
  if (phone.startsWith('+44') || (cleanPhone.startsWith('44') && cleanPhone.length >= 12)) {
    return 'UK';
  }

  // UK domestic format (starts with 0)
  if (phone.startsWith('0') && cleanPhone.length >= 10 && cleanPhone.length <= 11) {
    return 'UK';
  }

  // Brazilian formatted phone detection (high confidence)
  if (/^\(\d{2}\)\s\d{4,5}-\d{4}$/.test(phone)) {
    return 'BR';
  }

  // Brazilian phone detection - check for typical Brazilian area codes
  if (!phone.startsWith('+') && !phone.startsWith('0') && (cleanPhone.length === 10 || cleanPhone.length === 11)) {
    // Brazilian area codes start with 1-9, UK mobile numbers typically start with 7
    const firstDigit = cleanPhone.charAt(0);
    const secondDigit = cleanPhone.charAt(1);

    // If starts with 7 and is 10 digits, likely UK mobile without prefix
    if (firstDigit === '7' && cleanPhone.length === 10) {
      return 'UK';
    }

    // Brazilian area codes: 11-99 (first two digits)
    if (firstDigit >= '1' && firstDigit <= '9' && secondDigit >= '1' && secondDigit <= '9') {
      return 'BR';
    }
  }

  return 'UNKNOWN';
};

export const validatePhone = (phone: string): boolean => {
  if (!phone || phone.trim() === '') return false;

  const country = detectPhoneCountry(phone);

  switch (country) {
    case 'BR':
      return validateBrazilianPhone(phone);
    case 'UK':
      return validateUKPhone(phone);
    default:
      // For unknown formats, do basic validation
      const cleanPhone = phone.replace(/\D/g, '');
      return cleanPhone.length >= 8 && cleanPhone.length <= 15;
  }
};

export const validateBrazilianPhone = (phone: string): boolean => {
  // Brazilian phone format: (XX) XXXXX-XXXX or (XX) XXXX-XXXX
  const formattedRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  if (formattedRegex.test(phone)) return true;

  // Raw digits validation
  const digits = phone.replace(/\D/g, '');
  return digits.length === 10 || digits.length === 11;
};

export const validateUKPhone = (phone: string): boolean => {
  const cleanPhone = phone.replace(/\D/g, '');

  // UK international format: +44 followed by 10 digits
  if (phone.startsWith('+44')) {
    return cleanPhone.length === 12 && cleanPhone.startsWith('44');
  }

  // UK domestic format: starts with 0, 10-11 digits total
  if (phone.startsWith('0')) {
    return cleanPhone.length >= 10 && cleanPhone.length <= 11;
  }

  // Raw UK number (without +44 or 0)
  if (cleanPhone.length === 10 || cleanPhone.length === 11) {
    return true;
  }

  return false;
};

export const formatPhone = (phone: string): string => {
  if (!phone) return phone;

  const country = detectPhoneCountry(phone);

  switch (country) {
    case 'BR':
      return formatBrazilianPhone(phone);
    case 'UK':
      return formatUKPhone(phone);
    default:
      return phone; // Return as-is for unknown formats
  }
};

export const formatBrazilianPhone = (phone: string): string => {
  // Remove all non-digits
  const digits = phone.replace(/\D/g, '');

  // Format based on length
  if (digits.length === 11) {
    // Mobile: (XX) XXXXX-XXXX
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  } else if (digits.length === 10) {
    // Landline: (XX) XXXX-XXXX
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return phone; // Return original if invalid length
};

export const formatUKPhone = (phone: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');

  // Handle international format (+44)
  if (phone.startsWith('+44') || (cleanPhone.startsWith('44') && cleanPhone.length >= 12)) {
    const ukNumber = cleanPhone.startsWith('44') ? cleanPhone.slice(2) : cleanPhone;
    if (ukNumber.length === 10) {
      // Format as +44 XXXX XXXXXX
      return `+44 ${ukNumber.slice(0, 4)} ${ukNumber.slice(4)}`;
    }
  }

  // Handle domestic format (starting with 0) or raw UK number
  if (phone.startsWith('0') || (!phone.startsWith('+') && cleanPhone.length >= 10)) {
    const domesticNumber = cleanPhone.startsWith('0') ? cleanPhone : '0' + cleanPhone;
    if (domesticNumber.length === 11) {
      // Format as 0XXXX XXXXXX
      return `${domesticNumber.slice(0, 5)} ${domesticNumber.slice(5)}`;
    }
  }

  // Handle raw UK mobile number (10 digits starting with 7)
  if (cleanPhone.length === 10 && cleanPhone.startsWith('7')) {
    // Format as 0XXXX XXXXXX (add 0 prefix)
    return `0${cleanPhone.slice(0, 4)} ${cleanPhone.slice(4)}`;
  }

  return phone; // Return original if can't format
};

export const canSendInvitation = (familyMember: FamilyMember): boolean => {
  return !!(familyMember.email || familyMember.phone);
};

// Family relationship helpers for assignment algorithm
export const areFamilyMembers = async (
  student1Id: string,
  student2Id: string
): Promise<boolean> => {
  // Import supabase here to avoid circular dependencies
  const { supabase } = await import('@/integrations/supabase/client');

  try {
    // Check if student1 has student2 as a family member
    const { data: student1Family, error: error1 } = await supabase
      .from('family_members')
      .select('*')
      .eq('student_id', student1Id);

    if (error1) {
      console.error('Error checking family members for student1:', error1);
      return false;
    }

    // Check if student2 has student1 as a family member
    const { data: student2Family, error: error2 } = await supabase
      .from('family_members')
      .select('*')
      .eq('student_id', student2Id);

    if (error2) {
      console.error('Error checking family members for student2:', error2);
      return false;
    }

    // Get student profiles to compare emails
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('id, email')
      .in('id', [student1Id, student2Id]);

    if (profileError) {
      console.error('Error getting student profiles:', profileError);
      return false;
    }

    const student1Profile = profiles?.find(p => p.id === student1Id);
    const student2Profile = profiles?.find(p => p.id === student2Id);

    if (!student1Profile || !student2Profile) {
      return false;
    }

    // Check if student2's email is in student1's family members
    const isStudent2InStudent1Family = student1Family?.some(fm =>
      fm.email === student2Profile.email
    ) || false;

    // Check if student1's email is in student2's family members
    const isStudent1InStudent2Family = student2Family?.some(fm =>
      fm.email === student1Profile.email
    ) || false;

    return isStudent2InStudent1Family || isStudent1InStudent2Family;
  } catch (error) {
    console.error('Exception checking family relationship:', error);
    return false;
  }
};

// Check if two students can be paired for assignments based on S-38-T guidelines
export const canBePaired = async (
  student1: { id: string; gender: 'M' | 'F'; age?: number },
  student2: { id: string; gender: 'M' | 'F'; age?: number }
): Promise<boolean> => {
  // Same gender pairs are always allowed
  if (student1.gender === student2.gender) {
    return true;
  }

  // Different gender pairs require family relationship
  if (student1.gender !== student2.gender) {
    // Check if they are family members
    const areFamilyRelated = await areFamilyMembers(student1.id, student2.id);

    if (areFamilyRelated) {
      return true;
    }

    // For minors, check if they have the same parent/guardian
    if ((student1.age && student1.age < 18) || (student2.age && student2.age < 18)) {
      return await haveSameParent(student1.id, student2.id);
    }

    // Adult non-family members of different genders cannot be paired
    return false;
  }

  return true;
};

// Check if two students have the same parent/guardian
export const haveSameParent = async (
  student1Id: string,
  student2Id: string
): Promise<boolean> => {
  const { supabase } = await import('@/integrations/supabase/client');

  try {
    // This would need to be implemented based on your student-parent relationship structure
    // For now, returning false as a placeholder
    // You would query the estudantes table for id_pai_mae relationships

    const { data: students, error } = await supabase
      .from('profiles')
      .select('id, parent_id') // Assuming you have a parent_id field
      .in('id', [student1Id, student2Id]);

    if (error || !students || students.length !== 2) {
      return false;
    }

    const student1 = students.find(s => s.id === student1Id);
    const student2 = students.find(s => s.id === student2Id);

    return !!(student1?.parent_id && student2?.parent_id && student1.parent_id === student2.parent_id);
  } catch (error) {
    console.error('Exception checking parent relationship:', error);
    return false;
  }
};

// Get family relationship type between two students
export const getFamilyRelationship = async (
  student1Id: string,
  student2Id: string
): Promise<Relation | null> => {
  const { supabase } = await import('@/integrations/supabase/client');

  try {
    // Check if student2 is in student1's family
    const { data: familyMember, error } = await supabase
      .from('family_members')
      .select('relation')
      .eq('student_id', student1Id)
      .eq('email', (await supabase.from('profiles').select('email').eq('id', student2Id).single()).data?.email)
      .single();

    if (error || !familyMember) {
      return null;
    }

    return familyMember.relation as Relation;
  } catch (error) {
    console.error('Exception getting family relationship:', error);
    return null;
  }
};
