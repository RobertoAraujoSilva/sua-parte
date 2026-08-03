import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Heart, X, MapPin, Languages, Plane, UserRound, Loader2 } from 'lucide-react';
import ConnectLayout from '@/components/connect/ConnectLayout';
import { supabase } from '@/integrations/supabase/client';
import { useConnectProfile } from '@/hooks/useConnectProfile';
import { calcAge, type ConnectPreferences, type ConnectProfile } from '@/types/jwconnect';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface Candidate extends ConnectProfile {
  photoUrl?: string | null;
}

const ConnectDescobrir: React.FC = () => {
  const { t } = useTranslation('connect');
  const { profile } = useConnectProfile();
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [acting, setActing] = useState(false);
  const [index, setIndex] = useState(0);

  const current = candidates[index];

  const eligible = useCallback(
    (p: ConnectProfile, prefs: ConnectPreferences | null) => {
      if (!prefs) return true;
      const age = calcAge(p.data_nascimento);
      if (age < prefs.idade_min || age > prefs.idade_max) return false;
      if (prefs.generos_interesse?.length && !prefs.generos_interesse.includes(p.genero)) return false;
      if (prefs.paises?.length && (!p.pais || !prefs.paises.some((c) => c.toLowerCase() === p.pais!.toLowerCase())))
        return false;
      if (
        prefs.idiomas?.length &&
        !(p.idiomas ?? []).some((l) => prefs.idiomas.some((pl) => pl.toLowerCase() === l.toLowerCase()))
      )
        return false;
      if (prefs.status_espiritual?.length && !prefs.status_espiritual.includes(p.status_espiritual)) return false;
      if (prefs.apenas_dispostos_mudar && !p.disposto_mudar_cidade && !p.disposto_mudar_pais) return false;
      return true;
    },
    []
  );

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);

    const [prefsRes, swipesRes, profilesRes] = await Promise.all([
      supabase.from('connect_preferences').select('*').eq('profile_id', profile.id).maybeSingle(),
      supabase.from('connect_swipes').select('target_profile_id').eq('swiper_profile_id', profile.id),
      supabase.from('connect_profiles').select('*').eq('status', 'approved').neq('id', profile.id),
    ]);

    const prefs = (prefsRes.data as ConnectPreferences | null) ?? null;
    const seen = new Set((swipesRes.data ?? []).map((s: { target_profile_id: string }) => s.target_profile_id));
    const rows = ((profilesRes.data ?? []) as ConnectProfile[]).filter((p) => !seen.has(p.id) && eligible(p, prefs));

    const withPhotos: Candidate[] = await Promise.all(
      rows.map(async (p) => {
        const { data: photo } = await supabase
          .from('connect_photos')
          .select('storage_path')
          .eq('profile_id', p.id)
          .eq('moderation_status', 'approved')
          .order('is_primary', { ascending: false })
          .limit(1)
          .maybeSingle();
        if (!photo?.storage_path) return { ...p, photoUrl: null };
        const { data: signed } = await supabase.storage
          .from('connect-photos')
          .createSignedUrl(photo.storage_path, 3600);
        return { ...p, photoUrl: signed?.signedUrl ?? null };
      })
    );

    setCandidates(withPhotos);
    setIndex(0);
    setLoading(false);
  }, [profile, eligible]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSwipe = async (direction: 'like' | 'pass') => {
    if (!profile || !current || acting) return;
    setActing(true);

    const { error } = await supabase.from('connect_swipes').insert({
      swiper_profile_id: profile.id,
      target_profile_id: current.id,
      direction,
    });

    if (error) {
      toast.error(error.message);
      setActing(false);
      return;
    }

    if (direction === 'like') {
      const { data: match } = await supabase
        .from('connect_matches')
        .select('id')
        .or(
          `and(profile_a.eq.${profile.id},profile_b.eq.${current.id}),and(profile_a.eq.${current.id},profile_b.eq.${profile.id})`
        )
        .maybeSingle();
      if (match) toast.success(t('discover.itsAMatch'));
    }

    setIndex((i) => i + 1);
    setActing(false);
  };

  const remaining = useMemo(() => candidates.length - index, [candidates.length, index]);

  return (
    <ConnectLayout>
      <div className="max-w-md mx-auto space-y-4">
        <div className="flex items-baseline justify-between">
          <h1 className="text-2xl font-bold">{t('discover.title')}</h1>
          {!loading && remaining > 0 && (
            <span className="text-sm text-muted-foreground">{remaining}</span>
          )}
        </div>

        {loading ? (
          <Card>
            <Skeleton className="h-72 w-full rounded-t-lg" />
            <CardContent className="space-y-3 pt-4">
              <Skeleton className="h-6 w-1/2" />
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ) : !current ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground text-sm">
              {t('discover.empty')}
            </CardContent>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="h-72 bg-muted flex items-center justify-center">
              {current.photoUrl ? (
                <img
                  src={current.photoUrl}
                  alt={`Foto de ${current.apelido}`}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
              ) : (
                <UserRound className="h-20 w-20 text-muted-foreground/40" />
              )}
            </div>
            <CardContent className="space-y-3 pt-4">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-semibold">{current.apelido}</h2>
                <span className="text-muted-foreground">
                  {calcAge(current.data_nascimento)} {t('discover.years')}
                </span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{t(`status.${current.status_espiritual}`)}</Badge>
                {(current.disposto_mudar_cidade || current.disposto_mudar_pais) && (
                  <Badge variant="outline" className="gap-1">
                    <Plane className="h-3 w-3" />
                    {t('discover.willingToMove')}
                  </Badge>
                )}
              </div>

              {(current.cidade || current.pais) && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-4 w-4" />
                  {[current.cidade, current.pais].filter(Boolean).join(', ')}
                </p>
              )}

              {current.idiomas?.length > 0 && (
                <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                  <Languages className="h-4 w-4" />
                  {t('discover.speaks')}: {current.idiomas.join(', ')}
                </p>
              )}

              {current.bio && <p className="text-sm leading-relaxed">{current.bio}</p>}

              <div className="grid grid-cols-2 gap-3 pt-2">
                <Button
                  variant="outline"
                  size="lg"
                  disabled={acting}
                  onClick={() => handleSwipe('pass')}
                >
                  {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />}
                  <span className="ml-2">{t('discover.pass')}</span>
                </Button>
                <Button size="lg" disabled={acting} onClick={() => handleSwipe('like')}>
                  {acting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Heart className="h-4 w-4" />}
                  <span className="ml-2">{t('discover.like')}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ConnectLayout>
  );
};

export default ConnectDescobrir;
