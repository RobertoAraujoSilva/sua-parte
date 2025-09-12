export const decodeBase64Key = (encodedKey: string): string => {
  try {
    return atob(encodedKey);
  } catch {
    return '';
  }
};

export const isValidSupabaseKey = (key: string): boolean => {
  return key.startsWith('eyJ') || key.includes('supabase');
};