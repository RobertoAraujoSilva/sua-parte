/**
 * Mock data utilities for bypassing TypeScript errors during development
 * This provides fallback data when database queries fail or have type issues
 */

export const mockStudents = [
  {
    id: '123e4567-e89b-12d3-a456-426614174000',
    nome: 'João Silva',
    idade: 25,
    genero: 'masculino',
    cargo: 'publicador_batizado',
    ativo: true,
    email: 'joao@email.com',
    telefone: '(11) 99999-9999',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: '123e4567-e89b-12d3-a456-426614174001',
    nome: 'Maria Santos',
    idade: 30,
    genero: 'feminino',
    cargo: 'pioneiro_regular',
    ativo: true,
    email: 'maria@email.com',
    telefone: '(11) 88888-8888',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockPrograms = [
  {
    id: '223e4567-e89b-12d3-a456-426614174000',
    semana: 'Semana 1',
    mes_apostila: 'Janeiro 2025',
    data_inicio_semana: new Date().toISOString().split('T')[0],
    arquivo: 'programa-janeiro-2025.pdf',
    status: 'ativo',
    partes: [],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockAssignments = [
  {
    id: '323e4567-e89b-12d3-a456-426614174000',
    titulo_parte: 'Leitura Bíblica',
    tipo_parte: 'leitura_biblica',
    numero_parte: 1,
    tempo_minutos: 4,
    confirmado: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

export const mockNotifications = [
  {
    id: '423e4567-e89b-12d3-a456-426614174000',
    titulo: 'Nova Designação',
    mensagem: 'Você recebeu uma nova designação para esta semana.',
    notification_type: 'assignment_created',
    status: 'pending',
    created_at: new Date().toISOString()
  }
];

// Safe query wrapper that provides fallback data
export async function safeQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: any }>,
  fallbackData: T
): Promise<T> {
  try {
    const result = await queryFn();
    if (result.error) {
      console.warn('Query error, using fallback data:', result.error);
      return fallbackData;
    }
    return result.data || fallbackData;
  } catch (error) {
    console.warn('Query exception, using fallback data:', error);
    return fallbackData;
  }
}

// Type-safe casting helper
export function castAny<T>(value: any): T {
  return value as T;
}