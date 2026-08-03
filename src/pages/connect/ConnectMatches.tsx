import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { MessageCircle, UserRound, MapPin, HeartHandshake } from 'lucide-react';
import ConnectLayout from '@/components/connect/ConnectLayout';
import { supabase } from '@/integrations/supabase/client';
import { useConnectProfile } from '@/hooks/useConnectProfile';
import { calcAge, type ConnectMatch, type ConnectProfile } from '@/types/jwconnect';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface MatchItem {
  matchId: string;
  createdAt: string;
  partner: ConnectProfile;
  photoUrl: string | null;
}

const ConnectMatches: React.FC = () => {
  const { t, i18n } = useTranslation('connect');
  const { profile } = useConnectProfile();
  const [items, setItems] = useState<MatchItem[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!profile) return;
    setLoading(true);

    const { data: matches } = await supabase
      .from('connect_matches')
      .select('*')
      .eq('status', 'active')
      .or(`profile_a.eq.${profile.id},profile_b.eq.${profile.id}`)
      .order('created_at', { ascending: false });

    const rows = (matches ?? []) as ConnectMatch[];
    const partnerIds = rows.map((m) => (m.profile_a === profile.id ? m.profile_b : m.profile_a));

    if (partnerIds.length === 0) {
      setItems([]);
      setLoading(false);
      return;
    }

    const { data: profiles } = await supabase
      .from('connect_profiles')
      .select('*')
      .in('id', partnerIds);

    const byId = new Map((profiles ?? []).map((p) => [p.id, p as ConnectProfile]));

    const built = await Promise.all(
      rows.map(async (m) => {
        const partnerId = m.profile_a === profile.id ? m.profile_b : m.profile_a;
        const partner = byId.get(partnerId);
        if (!partner) return null;

        const { data: photo } = await supabase
          .from('connect_photos')
          .select('storage_path')
          .eq('profile_id', partner.id)
          .eq('moderation_status', 'approved')
          .order('is_primary', { ascending: false })
          .limit(1)
          .maybeSingle();

        let photoUrl: string | null = null;
        if (photo?.storage_path) {
          const { data: signed } = await supabase.storage
            .from('connect-photos')
            .createSignedUrl(photo.storage_path, 3600);
          photoUrl = signed?.signedUrl ?? null;
        }

        return { matchId: m.id, createdAt: m.created_at, partner, photoUrl } as MatchItem;
      })
    );

    setItems(built.filter(Boolean) as MatchItem[]);
    setLoading(false);
  }, [profile]);

  useEffect(() => {
    void load();
  }, [load]);

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString(i18n.language, { day: '2-digit', month: 'long', year: 'numeric' });

  return (
    <ConnectLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <header className="space-y-1">
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <HeartHandshake className="h-6 w-6 text-primary" />
            {t('matches.title')}
          </h1>
          <p className="text-sm text-muted-foreground">{t('chat.safetyNotice')}</p>
        </header>

        {loading ? (
          <div className="space-y-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        ) : items.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center space-y-4">
              <p className="text-muted-foreground">{t('matches.empty')}</p>
              <Button asChild variant="outline">
                <Link to="/connect/descobrir">{t('nav.discover')}</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.matchId}>
                <Card className="transition-colors hover:bg-muted/40">
                  <CardContent className="p-4 flex items-center gap-4">
                    <div className="h-16 w-16 shrink-0 rounded-full overflow-hidden bg-muted flex items-center justify-center">
                      {item.photoUrl ? (
                        <img
                          src={item.photoUrl}
                          alt={`${t('matches.title')} — ${item.partner.apelido}`}
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <UserRound className="h-7 w-7 text-muted-foreground" />
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-medium truncate">{item.partner.apelido}</span>
                        <span className="text-sm text-muted-foreground">
                          {calcAge(item.partner.data_nascimento)} {t('discover.years')}
                        </span>
                        <Badge variant="secondary">{t(`status.${item.partner.status_espiritual}`)}</Badge>
                      </div>
                      {(item.partner.cidade || item.partner.pais) && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {[item.partner.cidade, item.partner.pais].filter(Boolean).join(', ')}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {t('matches.since')} {formatDate(item.createdAt)}
                      </p>
                    </div>

                    <Button asChild size="sm" className="shrink-0">
                      <Link to={`/connect/chat/${item.matchId}`}>
                        <MessageCircle className="h-4 w-4 sm:mr-2" />
                        <span className="hidden sm:inline">{t('matches.openChat')}</span>
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ConnectLayout>
  );
};

export default ConnectMatches;
