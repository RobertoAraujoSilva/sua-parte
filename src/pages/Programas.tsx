import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Download, FileText, BookOpen, Calendar, Eye, AlertTriangle } from 'lucide-react';
import { parseMWBContent, MWBProgram } from '@/utils/mwbParser';
import { useTranslation } from '@/hooks/useTranslation';

interface PDFEntry {
  label: string;
  fileName: string;
  url: string; // URL pública servida por /materials
}

// Tipos do JSON mock do backend (/api/programacoes/mock?mes=YYYY-MM)
interface ParteJSON {
  idParte: number;
  titulo: string;
  duracaoMin: number;
  tipo: string;
  referencias?: string[];
  restricoes?: Record<string, unknown>;
  tema?: string;
}

interface SecaoJSON {
  secao: string;
  partes: ParteJSON[];
}

interface SemanaJSON {
  idSemana: string;
  semanaLabel: string;
  tema: string;
  programacao: SecaoJSON[];
}

const ptPDFs: PDFEntry[] = [
  { label: 'Português – Setembro 2025', fileName: 'mwb_T_202509.pdf', url: '/materials/programs/portuguese/mwb_T_202509.pdf' },
  { label: 'Português – Janeiro 2026', fileName: 'mwb_T_202601.pdf', url: '/materials/programs/portuguese/mwb_T_202601.pdf' },
  { label: 'Português – Julho 2025', fileName: 'mwb_T_202507.pdf', url: '/materials/programs/portuguese/mwb_T_202507.pdf' },
  { label: 'Português – Novembro 2025', fileName: 'mwb_T_202511.pdf', url: '/materials/programs/portuguese/mwb_T_202511.pdf' },
];

const enPDFs: PDFEntry[] = [
  { label: 'English – January 2026', fileName: 'mwb_E_202601.pdf', url: '/materials/programs/english/mwb_E_202601.pdf' },
  { label: 'English – July 2025', fileName: 'mwb_E_202507.pdf', url: '/materials/programs/english/mwb_E_202507.pdf' },
  { label: 'English – September 2025', fileName: 'mwb_E_202509.pdf', url: '/materials/programs/english/mwb_E_202509.pdf' },
  { label: 'English – November 2025', fileName: 'mwb_E_202511.pdf', url: '/materials/programs/english/mwb_E_202511.pdf' },
];

const extractMonthCode = (fileName: string): string | null => {
  const m = fileName.match(/mwb_[ET]_(\d{4})(\d{2})/i);
  if (!m) return null;
  const year = m[1];
  const month = m[2];
  return `${year}-${month}`; // ex: 2025-09
};

const Programas: React.FC = () => {
  const { t } = useTranslation();
  const [activeLang, setActiveLang] = useState<'pt' | 'en'>('pt');
  const [selected, setSelected] = useState<PDFEntry | null>(ptPDFs[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [semanas, setSemanas] = useState<SemanaJSON[]>([]);

  const list = activeLang === 'pt' ? ptPDFs : enPDFs;

  // Preview simplificado (fallback) com base no nome do arquivo
  const preview: MWBProgram[] = useMemo(() => {
    if (!selected) return [];
    return parseMWBContent(selected.fileName);
  }, [selected]);

  // Buscar programação real do backend quando houver JSON disponível
  useEffect(() => {
    const run = async () => {
      if (!selected) return;
      setError(null);
      setSemanas([]);

      const mesCode = extractMonthCode(selected.fileName);
      if (!mesCode) return; // fallback manterá preview

      try {
        setLoading(true);
        const resp = await fetch(`/api/programacoes/mock?mes=${mesCode}`);
        if (resp.status === 404) {
          // Sem JSON para o mês → permanecer no fallback
          setSemanas([]);
          setLoading(false);
          return;
        }
        if (!resp.ok) {
          throw new Error(`HTTP ${resp.status}`);
        }
        const data = await resp.json();
        if (Array.isArray(data)) {
          setSemanas(data as SemanaJSON[]);
        } else {
          setSemanas([]);
        }
      } catch (e) {
        console.error('Erro ao carregar programação mock:', e);
        setError(e instanceof Error ? e.message : 'Erro desconhecido');
        setSemanas([]);
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [selected]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full max-w-[1600px] mx-auto px-2 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{t('programs.pageTitle')}</h1>
          <p className="text-sm sm:text-base text-gray-600">{t('programs.pageSubtitle')}</p>
        </div>

        <Tabs defaultValue="pt" value={activeLang} onValueChange={(v) => {
          const lang = v === 'pt' ? 'pt' : 'en';
          setActiveLang(lang);
          setSelected((lang === 'pt' ? ptPDFs : enPDFs)[0] || null);
        }}>
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="pt" className="flex-1 sm:flex-initial">{t('programs.languageTabs.portuguese')}</TabsTrigger>
            <TabsTrigger value="en" className="flex-1 sm:flex-initial">{t('programs.languageTabs.english')}</TabsTrigger>
          </TabsList>

          <TabsContent value="pt">
            <PDFList entries={ptPDFs} selected={selected} onSelect={setSelected} />
          </TabsContent>

          <TabsContent value="en">
            <PDFList entries={enPDFs} selected={selected} onSelect={setSelected} />
          </TabsContent>
        </Tabs>

        {/* Área de preview/real */}
        {selected && (
          <Card className="mt-6">
            <CardHeader className="flex flex-col gap-4">
              <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                <BookOpen className="h-5 w-5 text-blue-600 flex-shrink-0" />
                <span className="truncate">{t('programs.monthLabel')} <span className="font-normal text-gray-700">{selected.label}</span></span>
              </CardTitle>
              <div className="responsive-buttons">
                <a href={selected.url} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-initial">
                  <Button variant="outline" className="w-full flex items-center justify-center gap-2">
                    <Download className="h-4 w-4" /> {t('programs.downloadPdf')}
                  </Button>
                </a>
                <Button variant="secondary" className="flex-1 sm:flex-initial w-full flex items-center justify-center gap-2" onClick={() => window.open(selected.url, '_blank') }>
                  <Eye className="h-4 w-4" /> {t('programs.openNewTab')}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="flex items-center gap-2 p-3 mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded">
                  <AlertTriangle className="h-4 w-4 flex-shrink-0" />
                  {t('programs.loadingError', { error })}
                </div>
              )}
              {loading ? (
                <div className="text-sm text-gray-600">{t('programs.loadingSchedule')}</div>
              ) : semanas.length > 0 ? (
                <RealSchedule semanas={semanas} />
              ) : (
                <FallbackPreview preview={preview} />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

const PDFList: React.FC<{ entries: PDFEntry[]; selected: PDFEntry | null; onSelect: (e: PDFEntry) => void }>
= ({ entries, selected, onSelect }) => {
  const { t } = useTranslation();
  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
          <FileText className="h-5 w-5 text-gray-700" /> {t('programs.availableFiles')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {entries.map((e) => (
            <div key={e.fileName} className={`p-4 border rounded-lg bg-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${selected?.fileName === e.fileName ? 'border-blue-400 ring-1 ring-blue-200' : 'border-gray-200'}`}>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">{e.label}</div>
                <div className="text-xs text-gray-500 truncate">{e.fileName}</div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
                <Button size="sm" variant={selected?.fileName === e.fileName ? 'default' : 'outline'} onClick={() => onSelect(e)} className="flex-1 sm:flex-initial">
                  {t('programs.viewButton')}
                </Button>
                <a href={e.url} target="_blank" rel="noopener noreferrer" className="flex-1 sm:flex-initial">
                  <Button size="sm" variant="secondary" className="w-full flex items-center justify-center gap-2">
                    <Download className="h-4 w-4" /> PDF
                  </Button>
                </a>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

const RealSchedule: React.FC<{ semanas: SemanaJSON[] }>
= ({ semanas }) => {
  const { t } = useTranslation();
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
      {semanas.map((semana, idx) => (
        <Card key={semana.idSemana} className="border-blue-100">
          <CardHeader>
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Calendar className="h-4 w-4 text-blue-600" /> {semana.semanaLabel}
            </CardTitle>
            <div className="text-sm text-gray-600">{semana.tema}</div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {semana.programacao.map((secao) => (
                <div key={secao.secao}>
                  <div className="font-semibold text-gray-800 mb-2">{secao.secao}</div>
                  <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
                    {secao.partes.map((p) => (
                      <li key={p.idParte}>
                        <span className="font-medium">{p.titulo}</span>
                        {p.duracaoMin ? ` — ${p.duracaoMin} min` : ''}
                        {p.referencias && p.referencias.length > 0 && (
                          <span className="text-gray-500"> — {p.referencias.join('; ')}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

const FallbackPreview: React.FC<{ preview: MWBProgram[] }>
= ({ preview }) => {
  const { t } = useTranslation();
  return (
    <div>
      <div className="p-3 mb-4 text-sm text-blue-700 bg-blue-50 border border-blue-200 rounded">
        {t('programs.noJsonFound')}
      </div>
      {preview.length === 0 ? (
        <div className="text-sm text-gray-600">{t('programs.noWeeksFound')}</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
          {preview.map((week, idx) => (
            <Card key={idx} className="border-blue-100">
              <CardHeader>
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-600 flex-shrink-0" /> 
                  <span className="truncate">{t('programs.weekLabel', { number: idx + 1, date: week.date })}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Section title={t('programs.sections.treasures')} items={week.parts.treasures.map(t => ({ title: t.title + (t.reading ? ` — ${t.reading}` : ''), time: t.time }))} />
                  <Section title={t('programs.sections.ministry')} items={week.parts.ministry.map(t => ({ title: t.title, time: t.time }))} />
                  <Section title={t('programs.sections.christianLife')} items={week.parts.christianLife.map(t => ({ title: t.title, time: t.time }))} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

const Section: React.FC<{ title: string; items: { title: string; time: string }[] }>
= ({ title, items }) => (
  <div>
    <div className="font-semibold text-gray-800 mb-2">{title}</div>
    <ul className="text-sm text-gray-700 space-y-1 list-disc pl-5">
      {items.map((it, i) => (
        <li key={i}>
          <span className="font-medium">{it.title}</span>
          {` — `}
          <span className="text-gray-600">{it.time}</span>
        </li>
      ))}
    </ul>
  </div>
);

export default Programas;
