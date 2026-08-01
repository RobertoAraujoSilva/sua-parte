import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { Trash2, Upload } from 'lucide-react';
import ConnectLayout from '@/components/connect/ConnectLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useConnectProfile } from '@/hooks/useConnectProfile';
import { SPIRITUAL_STATUSES, type ConnectPhoto, type ConnectSpiritualStatus } from '@/types/jwconnect';
import { isCleanText } from '@/lib/connect/contentFilter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ConnectPerfil: React.FC = () => {
  const { t } = useTranslation('connect');
  const { user } = useAuth();
  const { profile, refresh } = useConnectProfile();
  const [saving, setSaving] = useState(false);
  const [photos, setPhotos] = useState<Array<ConnectPhoto & { url?: string }>>([]);

  const [form, setForm] = useState({
    apelido: '',
    cidade: '',
    pais: '',
    congregacao: '',
    status_espiritual: 'batizado' as ConnectSpiritualStatus,
    tempo_na_verdade_anos: '',
    idiomas: '',
    bio: '',
    disposto_mudar_cidade: false,
    disposto_mudar_pais: false,
  });

  const [prefs, setPrefs] = useState({
    idade_min: 18,
    idade_max: 60,
    generos_interesse: [] as string[],
    paises: '',
    idiomas: '',
    apenas_dispostos_mudar: false,
  });

  useEffect(() => {
    if (!profile) return;
    setForm({
      apelido: profile.apelido,
      cidade: profile.cidade ?? '',
      pais: profile.pais ?? '',
      congregacao: profile.congregacao ?? '',
      status_espiritual: profile.status_espiritual,
      tempo_na_verdade_anos: profile.tempo_na_verdade_anos?.toString() ?? '',
      idiomas: (profile.idiomas ?? []).join(', '),
      bio: profile.bio ?? '',
      disposto_mudar_cidade: profile.disposto_mudar_cidade,
      disposto_mudar_pais: profile.disposto_mudar_pais,
    });
  }, [profile]);

  const loadPhotos = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('connect_photos')
      .select('*')
      .eq('profile_id', profile.id)
      .order('created_at');
    const rows = (data ?? []) as ConnectPhoto[];
    const withUrls = await Promise.all(
      rows.map(async (p) => {
        const { data: signed } = await supabase.storage
          .from('connect-photos')
          .createSignedUrl(p.storage_path, 3600);
        return { ...p, url: signed?.signedUrl };
      })
    );
    setPhotos(withUrls);
  }, [profile]);

  const loadPrefs = useCallback(async () => {
    if (!profile) return;
    const { data } = await supabase
      .from('connect_preferences')
      .select('*')
      .eq('profile_id', profile.id)
      .maybeSingle();
    if (data) {
      setPrefs({
        idade_min: data.idade_min,
        idade_max: data.idade_max,
        generos_interesse: data.generos_interesse ?? [],
        paises: (data.paises ?? []).join(', '),
        idiomas: (data.idiomas ?? []).join(', '),
        apenas_dispostos_mudar: data.apenas_dispostos_mudar,
      });
    }
  }, [profile]);

  useEffect(() => {
    void loadPhotos();
    void loadPrefs();
  }, [loadPhotos, loadPrefs]);

  const saveProfile = async () => {
    if (!profile) return;
    if (form.bio && !isCleanText(form.bio)) {
      toast.error(t('filter.blocked'));
      return;
    }
    setSaving(true);
    const { error } = await supabase
      .from('connect_profiles')
      .update({
        apelido: form.apelido.trim(),
        cidade: form.cidade.trim() || null,
        pais: form.pais.trim() || null,
        congregacao: form.congregacao.trim() || null,
        status_espiritual: form.status_espiritual,
        tempo_na_verdade_anos: form.tempo_na_verdade_anos
          ? Number(form.tempo_na_verdade_anos)
          : null,
        idiomas: form.idiomas.split(',').map((s) => s.trim()).filter(Boolean),
        bio: form.bio.trim() || null,
        disposto_mudar_cidade: form.disposto_mudar_cidade,
        disposto_mudar_pais: form.disposto_mudar_pais,
      })
      .eq('id', profile.id);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success(t('profile.saved'));
    await refresh();
  };

  const savePrefs = async () => {
    if (!profile) return;
    const payload = {
      profile_id: profile.id,
      idade_min: prefs.idade_min,
      idade_max: prefs.idade_max,
      generos_interesse: prefs.generos_interesse,
      paises: prefs.paises.split(',').map((s) => s.trim()).filter(Boolean),
      idiomas: prefs.idiomas.split(',').map((s) => s.trim()).filter(Boolean),
      apenas_dispostos_mudar: prefs.apenas_dispostos_mudar,
    };
    const { error } = await supabase
      .from('connect_preferences')
      .upsert(payload, { onConflict: 'profile_id' });
    if (error) return toast.error(error.message);
    toast.success(t('profile.prefsSaved'));
  };

  const uploadPhoto = async (file: File) => {
    if (!profile || !user) return;
    const path = `${user.id}/${crypto.randomUUID()}-${file.name.replace(/[^\w.-]/g, '_')}`;
    const { error: upErr } = await supabase.storage.from('connect-photos').upload(path, file);
    if (upErr) return toast.error(upErr.message);
    const { error } = await supabase.from('connect_photos').insert({
      profile_id: profile.id,
      storage_path: path,
      is_primary: photos.length === 0,
    });
    if (error) return toast.error(error.message);
    await loadPhotos();
  };

  const removePhoto = async (photo: ConnectPhoto) => {
    await supabase.storage.from('connect-photos').remove([photo.storage_path]);
    await supabase.from('connect_photos').delete().eq('id', photo.id);
    await loadPhotos();
  };

  const deleteAccount = async () => {
    if (!profile) return;
    if (!window.confirm(t('profile.deleteConfirm'))) return;
    const paths = photos.map((p) => p.storage_path);
    if (paths.length) await supabase.storage.from('connect-photos').remove(paths);
    const { error } = await supabase.from('connect_profiles').delete().eq('id', profile.id);
    if (error) return toast.error(error.message);
    toast.success(t('profile.deleted'));
    window.location.href = '/connect';
  };

  const toggleGender = (g: string) =>
    setPrefs((p) => ({
      ...p,
      generos_interesse: p.generos_interesse.includes(g)
        ? p.generos_interesse.filter((x) => x !== g)
        : [...p.generos_interesse, g],
    }));

  return (
    <ConnectLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold">{t('profile.title')}</h1>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t('request.nickname')}</Label>
                <Input value={form.apelido} onChange={(e) => setForm({ ...form, apelido: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('request.spiritualStatus')}</Label>
                <Select
                  value={form.status_espiritual}
                  onValueChange={(v) => setForm({ ...form, status_espiritual: v as ConnectSpiritualStatus })}
                >
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {SPIRITUAL_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>{t(`status.${s}`)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t('request.city')}</Label>
                <Input value={form.cidade} onChange={(e) => setForm({ ...form, cidade: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('request.country')}</Label>
                <Input value={form.pais} onChange={(e) => setForm({ ...form, pais: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('request.congregation')}</Label>
                <Input value={form.congregacao} onChange={(e) => setForm({ ...form, congregacao: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t('request.yearsInTruth')}</Label>
                <Input
                  type="number"
                  min={0}
                  value={form.tempo_na_verdade_anos}
                  onChange={(e) => setForm({ ...form, tempo_na_verdade_anos: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t('request.languages')}</Label>
              <Input value={form.idiomas} onChange={(e) => setForm({ ...form, idiomas: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('request.bio')}</Label>
              <Textarea rows={4} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.disposto_mudar_cidade}
                onCheckedChange={(v) => setForm({ ...form, disposto_mudar_cidade: Boolean(v) })}
              />
              {t('request.willingCity')}
            </label>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={form.disposto_mudar_pais}
                onCheckedChange={(v) => setForm({ ...form, disposto_mudar_pais: Boolean(v) })}
              />
              {t('request.willingCountry')}
            </label>
            <Button onClick={saveProfile} disabled={saving}>{t('profile.save')}</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">{t('profile.photos')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {photos.map((p) => (
                <div key={p.id} className="space-y-1">
                  <div className="aspect-square rounded-md overflow-hidden bg-muted">
                    {p.url && <img src={p.url} alt={t('profile.photos')} className="w-full h-full object-cover" loading="lazy" />}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <Badge variant={p.moderation_status === 'approved' ? 'default' : 'secondary'} className="text-[10px]">
                      {t(`profile.photo${p.moderation_status === 'approved' ? 'Approved' : p.moderation_status === 'rejected' ? 'Rejected' : 'Pending'}`)}
                    </Badge>
                    <Button size="icon" variant="ghost" onClick={() => removePhoto(p)} aria-label={t('profile.removePhoto')}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <div>
              <Label htmlFor="photo-input" className="inline-flex items-center gap-2 cursor-pointer text-sm border rounded-md px-3 py-2 hover:bg-muted">
                <Upload className="h-4 w-4" />
                {t('profile.addPhoto')}
              </Label>
              <input
                id="photo-input"
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) void uploadPhoto(f);
                  e.target.value = '';
                }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">{t('profile.preferences')}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label>{t('profile.ageRange')}</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" min={18} value={prefs.idade_min} onChange={(e) => setPrefs({ ...prefs, idade_min: Number(e.target.value) })} />
                  <span>—</span>
                  <Input type="number" max={120} value={prefs.idade_max} onChange={(e) => setPrefs({ ...prefs, idade_max: Number(e.target.value) })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t('profile.interestedIn')}</Label>
                <div className="flex gap-4 pt-2">
                  {(['masculino', 'feminino'] as const).map((g) => (
                    <label key={g} className="flex items-center gap-2 text-sm">
                      <Checkbox checked={prefs.generos_interesse.includes(g)} onCheckedChange={() => toggleGender(g)} />
                      {t(g === 'masculino' ? 'request.male' : 'request.female')}
                    </label>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t('profile.countries')}</Label>
              <Input value={prefs.paises} onChange={(e) => setPrefs({ ...prefs, paises: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>{t('profile.langs')}</Label>
              <Input value={prefs.idiomas} onChange={(e) => setPrefs({ ...prefs, idiomas: e.target.value })} />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={prefs.apenas_dispostos_mudar}
                onCheckedChange={(v) => setPrefs({ ...prefs, apenas_dispostos_mudar: Boolean(v) })}
              />
              {t('profile.onlyWilling')}
            </label>
            <Button onClick={savePrefs} variant="secondary">{t('profile.savePrefs')}</Button>
          </CardContent>
        </Card>

        <Button variant="destructive" onClick={deleteAccount}>{t('profile.deleteAccount')}</Button>
      </div>
    </ConnectLayout>
  );
};

export default ConnectPerfil;
