import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { ConnectProfile } from '@/types/jwconnect';

interface UseConnectProfileResult {
  profile: ConnectProfile | null;
  isModerator: boolean;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useConnectProfile(): UseConnectProfileResult {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<ConnectProfile | null>(null);
  const [isModerator, setIsModerator] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setIsModerator(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const [profileRes, moderatorRes] = await Promise.all([
      supabase
        .from('connect_profiles')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(),
      supabase.rpc('is_connect_moderator', { _user_id: user.id }),
    ]);

    if (profileRes.error) {
      setError(profileRes.error.message);
    }
    setProfile((profileRes.data as ConnectProfile | null) ?? null);
    setIsModerator(moderatorRes.error ? false : Boolean(moderatorRes.data));
    setLoading(false);
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    void load();
  }, [authLoading, load]);

  return { profile, isModerator, loading: authLoading || loading, error, refresh: load };
}
