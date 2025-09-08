import { useState, useCallback, useRef } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';
import { authLogger, createAuthMetrics } from '@/utils/authLogger';
import { withRefreshTokenErrorHandling } from '@/utils/refreshTokenHandler';

type UserRole = Database['public']['Enums']['user_role'];

interface UserProfile {
  id: string;
  nome_completo: string | null;
  congregacao: string | null;
  cargo: string | null;
  role: UserRole;
  date_of_birth: string | null;
  email: string;
  created_at: string | null;
  updated_at: string | null;
}

interface ProfileLoadResult {
  profile: UserProfile | null;
  fromCache: boolean;
  fromMetadata: boolean;
  error: string | null;
}

export const useProfileLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const metricsRef = useRef(createAuthMetrics());
  const cacheRef = useRef<Map<string, UserProfile>>(new Map());
  const retryCountRef = useRef<Map<string, number>>(new Map());

  const createProfileFromMetadata = useCallback(async (user: User): Promise<UserProfile | null> => {
    try {
      authLogger.debug('Creating profile from user metadata', { userId: user.id });
      
      const metadata = user.user_metadata || {};
      const email = user.email || '';

      // Try to insert into profiles table
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          id: user.id,
          nome_completo: metadata.nome_completo || '',
          congregacao: metadata.congregacao || '',
          cargo: metadata.cargo || '',
          role: (metadata.role as UserRole) || 'instrutor'
        })
        .select()
        .single();

      if (error) {
        authLogger.warning('Failed to create profile in database, using metadata only', error);
        // Return profile from metadata even if DB insert fails
        return {
          id: user.id,
          nome_completo: metadata.nome_completo || '',
          congregacao: metadata.congregacao || '',
          cargo: metadata.cargo || '',
          role: (metadata.role as UserRole) || 'instrutor',
          date_of_birth: metadata.date_of_birth || null,
          email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
      }

      const profileWithEmail = { ...data, email };
      authLogger.success('Profile created from metadata', profileWithEmail);
      return profileWithEmail as UserProfile;
    } catch (error) {
      authLogger.error('Error creating profile from metadata', error);
      return null;
    }
  }, []);

  const loadProfileWithRetry = useCallback(async (
    userId: string, 
    user: User,
    maxRetries: number = 2
  ): Promise<ProfileLoadResult> => {
    const metrics = metricsRef.current;
    metrics.startProfileLoad();

    // Check cache first
    const cached = cacheRef.current.get(userId);
    if (cached) {
      authLogger.debug('Profile loaded from cache', { userId });
      metrics.endProfileLoad(true);
      return { profile: cached, fromCache: true, fromMetadata: false, error: null };
    }

    const currentRetries = retryCountRef.current.get(userId) || 0;
    
    try {
      setIsLoading(true);
      
      // Get current session with refresh token error handling
      const { data: { session }, error: sessionError } = await withRefreshTokenErrorHandling(async () => {
        return await supabase.auth.getSession();
      });
      
      if (sessionError || !session) {
        throw new Error(`Session error: ${sessionError?.message || 'No session'}`);
      }

      // Fetch profile from database
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        if (profileError.code === 'PGRST116') {
          // Profile doesn't exist, create from metadata
          authLogger.info('Profile not found, creating from metadata', { userId });
          const newProfile = await createProfileFromMetadata(user);
          
          if (newProfile) {
            cacheRef.current.set(userId, newProfile);
            metrics.endProfileLoad(true);
            return { profile: newProfile, fromCache: false, fromMetadata: true, error: null };
          } else {
            throw new Error('Failed to create profile from metadata');
          }
        } else {
          throw new Error(`Profile fetch error: ${profileError.message}`);
        }
      }

      if (profileData) {
        const email = session.user.email || '';
        const profileWithEmail = { ...profileData, email } as UserProfile;
        
        // Cache the profile
        cacheRef.current.set(userId, profileWithEmail);
        
        authLogger.success('Profile loaded from database', { userId });
        metrics.endProfileLoad(true);
        return { profile: profileWithEmail, fromCache: false, fromMetadata: false, error: null };
      }

      throw new Error('No profile data returned');

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      authLogger.error(`Profile load attempt ${currentRetries + 1} failed`, errorMessage);

      // Retry logic
      if (currentRetries < maxRetries) {
        retryCountRef.current.set(userId, currentRetries + 1);
        authLogger.info(`Retrying profile load (${currentRetries + 1}/${maxRetries})`, { userId });
        
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000 * (currentRetries + 1)));
        return loadProfileWithRetry(userId, user, maxRetries);
      }

      // Max retries reached, try metadata fallback
      authLogger.warning('Max retries reached, attempting metadata fallback', { userId });
      const metadataProfile = await createProfileFromMetadata(user);
      
      if (metadataProfile) {
        cacheRef.current.set(userId, metadataProfile);
        metrics.endProfileLoad(true);
        return { profile: metadataProfile, fromCache: false, fromMetadata: true, error: errorMessage };
      }

      metrics.endProfileLoad(false, errorMessage);
      return { profile: null, fromCache: false, fromMetadata: false, error: errorMessage };
    } finally {
      setIsLoading(false);
      retryCountRef.current.delete(userId); // Reset retry count on completion
    }
  }, [createProfileFromMetadata]);

  const clearCache = useCallback((userId?: string) => {
    if (userId) {
      cacheRef.current.delete(userId);
      authLogger.debug('Profile cache cleared for user', { userId });
    } else {
      cacheRef.current.clear();
      authLogger.debug('Profile cache cleared for all users');
    }
  }, []);

  const getMetrics = useCallback(() => {
    return metricsRef.current.getMetrics();
  }, []);

  return {
    loadProfileWithRetry,
    clearCache,
    isLoading,
    getMetrics
  };
};
