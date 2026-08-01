import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import ConnectLayout from '@/components/connect/ConnectLayout';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useConnectProfile } from '@/hooks/useConnectProfile';
import { SPIRITUAL_STATUSES, calcAge, type ConnectSpiritualStatus } from '@/types/jwconnect';
import { isCleanText } from '@/lib/connect/contentFilter';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ConnectSolicitar: React.FC = () => {
  const { t } = useTranslation('connect');
  const { user } = useAuth();
  const { profile, refresh } = useConnectProfile();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    apelido: '',
    data_nascimento: '',
    genero: '' as '' | 'masculino' | 'feminino',
    cidade: '',
    pais: '',
    congregacao: '',
    status_espiritual: '' as '' | ConnectSpiritualStatus,
    tempo_na_verdade_anos: '',
    idiomas: '',
    bio: '',
    disposto_mudar_cidade: false,
    disposto_mudar_pais: false,
    consent: false,
    conduct: false,
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  if (profile) {
    navigate('/connect', { replace: true });
    return null;
  }

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (
      !form.apelido.trim() ||
      !form.data_nascimento ||
      !form.genero ||
      !form.status_espiritual ||
      !form.consent ||
      !form.conduct
    ) {
      toast.error(t('request.required'));
      return;
    }
    if (calcAge(form.data_nascimento) < 18) {
      toast.error(t('request.minAge'));
      return;
    }
    if (form.bio && !isCleanText(form.bio)) {
      toast.error(t('filter.blocked'));
      return;
    }

    setSaving(true);
    const { error } = await supabase.from('connect_profiles').insert({
      user_id: user.id,
      apelido: form.apelido.trim(),
      data_nascimento: form.data_nascimento,
      genero: form.genero,
      cidade: form.cidade.trim() || null,
      pais: form.pais.trim() || null,
      congregacao: form.congregacao.trim() || null,
      status_espiritual: form.status_espiritual,
      tempo_na_verdade_anos: form.tempo_na_verdade_anos
        ? Number(form.tempo_na_verdade_anos)
        : null,
      idiomas: form.idiomas
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      bio: form.bio.trim() || null,
      disposto_mudar_cidade: form.disposto_mudar_cidade,
      disposto_mudar_pais: form.disposto_mudar_pais,
      consent_religious_data: true,
      code_of_conduct_accepted_at: new Date().toISOString(),
      status: 'pending',
    });
    setSaving(false);

    if (error) {
      toast.error(`${t('request.error')} ${error.message}`);
      return;
    }
    toast.success(t('request.success'));
    await refresh();
    navigate('/connect', { replace: true });
  };

  return (
    <ConnectLayout>
      <form onSubmit={submit} className="max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>{t('request.title')}</CardTitle>
            <CardDescription>{t('request.subtitle')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label htmlFor="apelido">{t('request.nickname')} *</Label>
                <Input
                  id="apelido"
                  value={form.apelido}
                  onChange={(e) => set('apelido', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="nascimento">{t('request.birthdate')} *</Label>
                <Input
                  id="nascimento"
                  type="date"
                  value={form.data_nascimento}
                  onChange={(e) => set('data_nascimento', e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>{t('request.gender')} *</Label>
                <Select
                  value={form.genero}
                  onValueChange={(v) => set('genero', v as 'masculino' | 'feminino')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    <SelectItem value="masculino">{t('request.male')}</SelectItem>
                    <SelectItem value="feminino">{t('request.female')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>{t('request.spiritualStatus')} *</Label>
                <Select
                  value={form.status_espiritual}
                  onValueChange={(v) => set('status_espiritual', v as ConnectSpiritualStatus)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="—" />
                  </SelectTrigger>
                  <SelectContent className="bg-popover z-50">
                    {SPIRITUAL_STATUSES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {t(`status.${s}`)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="cidade">{t('request.city')}</Label>
                <Input id="cidade" value={form.cidade} onChange={(e) => set('cidade', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pais">{t('request.country')}</Label>
                <Input id="pais" value={form.pais} onChange={(e) => set('pais', e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="congregacao">{t('request.congregation')}</Label>
                <Input
                  id="congregacao"
                  value={form.congregacao}
                  onChange={(e) => set('congregacao', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="anos">{t('request.yearsInTruth')}</Label>
                <Input
                  id="anos"
                  type="number"
                  min={0}
                  max={100}
                  value={form.tempo_na_verdade_anos}
                  onChange={(e) => set('tempo_na_verdade_anos', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="idiomas">{t('request.languages')}</Label>
              <Input
                id="idiomas"
                placeholder="Português, English, Italiano, Español"
                value={form.idiomas}
                onChange={(e) => set('idiomas', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="bio">{t('request.bio')}</Label>
              <Textarea
                id="bio"
                rows={4}
                placeholder={t('request.bioPlaceholder')}
                value={form.bio}
                onChange={(e) => set('bio', e.target.value)}
              />
            </div>

            <div className="space-y-3">
              <label className="flex items-start gap-2 text-sm">
                <Checkbox
                  checked={form.disposto_mudar_cidade}
                  onCheckedChange={(v) => set('disposto_mudar_cidade', Boolean(v))}
                />
                <span>{t('request.willingCity')}</span>
              </label>
              <label className="flex items-start gap-2 text-sm">
                <Checkbox
                  checked={form.disposto_mudar_pais}
                  onCheckedChange={(v) => set('disposto_mudar_pais', Boolean(v))}
                />
                <span>{t('request.willingCountry')}</span>
              </label>
              <label className="flex items-start gap-2 text-sm">
                <Checkbox
                  checked={form.consent}
                  onCheckedChange={(v) => set('consent', Boolean(v))}
                />
                <span>{t('request.consent')}</span>
              </label>
              <label className="flex items-start gap-2 text-sm">
                <Checkbox
                  checked={form.conduct}
                  onCheckedChange={(v) => set('conduct', Boolean(v))}
                />
                <span>{t('request.acceptConduct')}</span>
              </label>
            </div>

            <Button type="submit" className="w-full" disabled={saving}>
              {t('request.submit')}
            </Button>
          </CardContent>
        </Card>
      </form>
    </ConnectLayout>
  );
};

export default ConnectSolicitar;
