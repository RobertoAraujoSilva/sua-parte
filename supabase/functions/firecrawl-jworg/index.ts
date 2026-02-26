const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface ParsedWeek {
  week: string;
  dateRange: string;
  bibleReading: string;
  songs: { opening: number; middle: number; closing: number };
  parts: ParsedPart[];
}

interface ParsedPart {
  id: number;
  title: string;
  duration: number;
  type: string;
  description: string;
  references: string[];
  section: string;
}

const JW_ORG_URLS: Record<string, string> = {
  pt: 'https://www.jw.org/pt/biblioteca/jw-apostila-do-mes/',
  en: 'https://www.jw.org/en/library/jw-meeting-workbook/',
};

function parseMarkdownToWeeks(markdown: string, language: string): ParsedWeek[] {
  const weeks: ParsedWeek[] = [];
  
  // Split by week headers - patterns like "## 18-24 de agosto" or "## August 18-24"
  const weekPattern = language === 'pt'
    ? /#{1,3}\s*(\d{1,2}[-–]\d{1,2}\s+de\s+\w+)/gi
    : /#{1,3}\s*(\w+\s+\d{1,2}[-–]\d{1,2})/gi;

  const weekSections = markdown.split(/(?=#{1,3}\s*(?:\d{1,2}[-–]|[A-Z][a-z]+\s+\d{1,2}[-–]))/);

  for (const section of weekSections) {
    if (!section.trim()) continue;

    // Extract week title
    const weekTitleMatch = section.match(/#{1,3}\s*(.+?)(?:\n|$)/);
    if (!weekTitleMatch) continue;
    const weekTitle = weekTitleMatch[1].trim();

    // Must contain a date range pattern
    const hasDateRange = language === 'pt'
      ? /\d{1,2}[-–]\d{1,2}\s+de\s+\w+/i.test(weekTitle)
      : /\w+\s+\d{1,2}[-–]\d{1,2}/i.test(weekTitle);
    if (!hasDateRange) continue;

    // Extract bible reading
    let bibleReading = '';
    const brMatch = section.match(/(?:LEITURA DA BÍBLIA|BIBLE READING)[:\s]*([^\n]+)/i)
      || section.match(/(?:PROVÉRBIOS|PROVERBS|SALMOS|PSALMS|GÊNESIS|GENESIS|ÊXODO|EXODUS)\s+\d+/i);
    if (brMatch) {
      bibleReading = (brMatch[1] || brMatch[0]).trim();
    }

    // Extract songs
    const songNumbers: number[] = [];
    const songMatches = section.matchAll(/(?:cântico|cantico|song|canto)\s*(\d+)/gi);
    for (const m of songMatches) {
      songNumbers.push(parseInt(m[1]));
    }
    const songs = {
      opening: songNumbers[0] || 0,
      middle: songNumbers[1] || 0,
      closing: songNumbers[2] || 0,
    };

    // Extract parts
    const parts: ParsedPart[] = [];
    let partId = 1;
    let currentSection = '';

    // Detect section headers
    const sectionPatterns = [
      { pattern: /TESOUROS DA PALAVRA DE DEUS|TREASURES FROM GOD'S WORD/i, name: 'treasures' },
      { pattern: /FAÇA SEU MELHOR NO MINISTÉRIO|APPLY YOURSELF TO THE FIELD MINISTRY/i, name: 'ministry' },
      { pattern: /NOSSA VIDA CRISTÃ|LIVING AS CHRISTIANS/i, name: 'living' },
    ];

    const lines = section.split('\n');
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;

      // Check for section headers
      for (const sp of sectionPatterns) {
        if (sp.pattern.test(trimmed)) {
          currentSection = sp.name;
        }
      }

      // Extract parts with duration pattern: "Title (X min)"
      const partMatch = trimmed.match(/[*•\-]?\s*\**(.+?)\**\s*\((\d+)\s*min\.?\)/i);
      if (partMatch) {
        const title = partMatch[1].replace(/\*+/g, '').replace(/^\d+\.\s*/, '').trim();
        const duration = parseInt(partMatch[2]);

        // Extract references from the line
        const refMatches = trimmed.match(/\b(?:th|lmd|lff|lfb|w\d{2}|it-\d+|Pro\.|Pr\s+\d+|ijwyp)[^,;)]*(?:[,;][^,;)]*)*/gi) || [];
        const references = refMatches.map(r => r.trim());

        // Determine type
        const type = determinePartType(title, trimmed, currentSection, language);

        // Extract description
        let description = '';
        const descMatch = trimmed.match(/[:\u2014—]\s*(.+?)(?:\(|$)/);
        if (descMatch) {
          description = descMatch[1].replace(/\*+/g, '').trim();
        }

        parts.push({
          id: partId++,
          title,
          duration,
          type,
          description: description || title,
          references,
          section: currentSection,
        });
      }
    }

    if (parts.length > 0 || bibleReading) {
      weeks.push({
        week: weekTitle,
        dateRange: weekTitle,
        bibleReading,
        songs,
        parts,
      });
    }
  }

  return weeks;
}

function determinePartType(title: string, fullText: string, section: string, language: string): string {
  const lower = (title + ' ' + fullText).toLowerCase();

  if (lower.includes('tesouros') || lower.includes('treasures from')) return 'treasures';
  if (lower.includes('joias') || lower.includes('spiritual gems')) return 'gems';
  if (lower.includes('leitura da bíblia') || lower.includes('bible reading')) return 'reading';
  if (lower.includes('iniciando conversa') || lower.includes('starting conversation') || lower.includes('primeira conversa') || lower.includes('initial call')) return 'starting';
  if (lower.includes('cultivando') || lower.includes('making return') || lower.includes('revisita') || lower.includes('return visit')) return 'following';
  if (lower.includes('fazendo discípulos') || lower.includes('making disciples') || lower.includes('estudo bíblico') && !lower.includes('congregação')) return 'making';
  if (lower.includes('explicando') || lower.includes('explaining')) return 'explaining';
  if (lower.includes('discurso') || lower.includes('talk')) return 'talk';
  if (lower.includes('estudo bíblico de congregação') || lower.includes('congregation bible study')) return 'study';
  if (lower.includes('discussão') || lower.includes('discussion')) return 'discussion';

  // Fallback based on section
  if (section === 'treasures') return 'treasures';
  if (section === 'ministry') return 'starting';
  if (section === 'living') return 'discussion';

  return 'other';
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { language = 'pt' } = await req.json();
    const url = JW_ORG_URLS[language] || JW_ORG_URLS.pt;

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      console.error('FIRECRAWL_API_KEY not configured');
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🔥 Firecrawl scraping: ${url}`);

    const firecrawlResponse = await fetch('https://api.firecrawl.dev/v1/scrape', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        formats: ['markdown'],
        onlyMainContent: true,
        waitFor: 3000,
      }),
    });

    const firecrawlData = await firecrawlResponse.json();

    if (!firecrawlResponse.ok) {
      console.error('Firecrawl API error:', firecrawlData);
      return new Response(
        JSON.stringify({ success: false, error: firecrawlData.error || `Firecrawl error ${firecrawlResponse.status}` }),
        { status: firecrawlResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const markdown = firecrawlData.data?.markdown || firecrawlData.markdown || '';
    
    if (!markdown) {
      console.error('No markdown content received from Firecrawl');
      return new Response(
        JSON.stringify({ success: false, error: 'No content received from Firecrawl' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📄 Received ${markdown.length} chars of markdown, parsing...`);

    const weeks = parseMarkdownToWeeks(markdown, language);

    console.log(`✅ Parsed ${weeks.length} weeks via Firecrawl`);

    return new Response(
      JSON.stringify({
        success: true,
        weeks,
        source: 'firecrawl',
        fetchedAt: new Date().toISOString(),
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in firecrawl-jworg:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Failed to scrape content' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
