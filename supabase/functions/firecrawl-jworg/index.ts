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

const JW_INDEX_URLS: Record<string, string> = {
  pt: 'https://www.jw.org/pt/biblioteca/jw-apostila-do-mes/',
  en: 'https://www.jw.org/en/library/jw-meeting-workbook/',
};

/** Scrape a URL via Firecrawl and return markdown */
async function scrapeUrl(url: string, apiKey: string): Promise<string> {
  const response = await fetch('https://api.firecrawl.dev/v1/scrape', {
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

  const data = await response.json();
  if (!response.ok) {
    throw new Error(`Firecrawl error ${response.status}: ${JSON.stringify(data.error || data)}`);
  }
  return data.data?.markdown || data.markdown || '';
}

/** Step 1: Extract week URLs from the index/workbook page */
function extractWeekUrls(markdown: string, language: string): { weekTitle: string; url: string }[] {
  const weeks: { weekTitle: string; url: string }[] = [];
  
  const linkPattern = /##\s*\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = linkPattern.exec(markdown)) !== null) {
    const title = match[1].trim();
    let url = match[2].trim();
    
    // Only match actual week links (contain day numbers like "6-12" or "6 de julho")
    const hasDateNumbers = /\d{1,2}[-–]\d{1,2}/.test(title) 
      || /\d{1,2}\s+de\s+\w+/.test(title);
    
    // Exclude workbook titles that have month–month pattern without day numbers
    const isWorkbookTitle = /^[A-Z][a-z]+[–-][A-Z][a-z]+\s+\d{4}$/i.test(title)
      || /^\w+[–-]\w+\s+de\s+\d{4}$/i.test(title);
    
    if (!hasDateNumbers || isWorkbookTitle) continue;

    if (url.startsWith('/')) {
      url = `https://www.jw.org${url}`;
    }
    
    weeks.push({ weekTitle: title, url });
  }

  return weeks;
}

/** Step 2: Parse a single week page markdown into a ParsedWeek */
function parseWeekPage(markdown: string, weekTitle: string, language: string): ParsedWeek {
  const parts: ParsedPart[] = [];
  let partId = 1;
  let currentSection = '';
  let bibleReading = '';

  // Extract songs: "Cântico 123" or "Song 123"
  const songNumbers: number[] = [];
  const songMatches = markdown.matchAll(/(?:cântico|cantico|song)\s+(\d+)/gi);
  for (const m of songMatches) {
    songNumbers.push(parseInt(m[1]));
  }

  // ===== BIBLE READING EXTRACTION =====
  // Strategy: look for the "Leitura da Bíblia" / "Bible Reading" part and extract
  // the scripture reference from its content line, e.g.:
  //   ### 3\. Leitura da Bíblia
  //   (4 min) [Jer. 13:1-14](...)
  // Also try broader patterns from the page title/header area

  // Pattern 1: Scripture ref right after "Leitura da Bíblia" / "Bible Reading" header
  const brHeaderPattern = language === 'pt'
    ? /Leitura da B[ií]blia[\s\S]{0,200}?\((\d+)\s*min\.?\)\s*\[([^\]]+)\]/i
    : /Bible Reading[\s\S]{0,200}?\((\d+)\s*min\.?\)\s*\[([^\]]+)\]/i;
  const brHeaderMatch = markdown.match(brHeaderPattern);
  if (brHeaderMatch) {
    bibleReading = brHeaderMatch[2].trim();
  }

  // Pattern 2: Fallback - look for book+chapter pattern near "Leitura" / "Reading"
  if (!bibleReading) {
    const brFallback = language === 'pt'
      ? markdown.match(/Leitura da B[ií]blia[\s\S]{0,300}?\[([A-ZÀ-Ú][a-zà-ú]+\.?\s+\d+[:\d\-–,\s]*)\]/i)
      : markdown.match(/Bible Reading[\s\S]{0,300}?\[([A-Z][a-z]+\.?\s+\d+[:\d\-–,\s]*)\]/i);
    if (brFallback) {
      bibleReading = brFallback[1].trim();
    }
  }

  // Pattern 3: From the page title area - e.g. "JEREMIAS 13-16" in the header
  if (!bibleReading) {
    const titlePattern = markdown.match(/^#\s+.*?([A-ZÀ-Ú]{3,}(?:\s+\d+[-–]\d+)?)/m);
    if (titlePattern && /\d/.test(titlePattern[1])) {
      bibleReading = titlePattern[1].trim();
    }
  }

  const lines = markdown.split('\n');
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Detect section headers
    if (/TESOUROS DA PALAVRA DE DEUS|TREASURES FROM GOD.S WORD/i.test(line)) {
      currentSection = 'treasures';
      continue;
    }
    if (/FA[ÇC]A SEU MELHOR NO MINIST[EÉ]RIO|APPLY YOURSELF TO THE FIELD MINISTRY/i.test(line)) {
      currentSection = 'ministry';
      continue;
    }
    if (/NOSSA VIDA CRIST[ÃA]|LIVING AS CHRISTIANS/i.test(line)) {
      currentSection = 'living';
      continue;
    }

    // Parse numbered parts: "### 1. Title" or "### 1\. Title"
    const numberedPartMatch = line.match(/^#{1,4}\s*(\d+)\\?\.\s*(.+)/);
    if (numberedPartMatch) {
      const title = numberedPartMatch[2].replace(/\*+/g, '').replace(/\[|\]/g, '').trim();
      
      // Look for duration in current line or next few lines
      let duration = 0;
      let description = '';
      const lookAhead = lines.slice(i, Math.min(i + 5, lines.length)).join(' ');
      
      const durationMatch = lookAhead.match(/\((\d+)\s*min\.?\)/i);
      if (durationMatch) {
        duration = parseInt(durationMatch[1]);
      }

      // Collect description from subsequent non-header lines
      for (let j = i + 1; j < Math.min(i + 8, lines.length); j++) {
        const nextLine = lines[j].trim();
        if (!nextLine || nextLine.startsWith('#') || nextLine.startsWith('![')) continue;
        if (nextLine.startsWith('Sua resposta') || nextLine.startsWith('Your Answer')) break;
        if (/^\((\d+)\s*min/.test(nextLine)) {
          const afterDuration = nextLine.replace(/^\(\d+\s*min\.?\)\s*/, '').trim();
          if (afterDuration) description = afterDuration;
          continue;
        }
        if (nextLine.length > 10 && !nextLine.startsWith('[') && !nextLine.startsWith('|')) {
          description = nextLine.replace(/\*+/g, '').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim();
          break;
        }
      }

      // Extract references from description area
      const refArea = lines.slice(i, Math.min(i + 6, lines.length)).join(' ');
      const references: string[] = [];
      const refMatches = refArea.matchAll(/\[_?([^_\]]+)_?\s*([^\]]*)\]\([^)]+\)/g);
      for (const rm of refMatches) {
        const ref = (rm[1] + ' ' + (rm[2] || '')).trim();
        if (ref && !ref.includes('Cântico') && !ref.includes('Song') && ref.length < 50) {
          references.push(ref);
        }
      }

      const type = determinePartType(title, description + ' ' + refArea, currentSection, language);

      parts.push({
        id: partId++,
        title: cleanTitle(title),
        duration,
        type,
        description: description || title,
        references,
        section: currentSection,
      });
      continue;
    }
  }

  return {
    week: weekTitle,
    dateRange: weekTitle,
    bibleReading,
    songs: {
      opening: songNumbers[0] || 0,
      middle: songNumbers[1] || 0,
      closing: songNumbers[2] || 0,
    },
    parts,
  };
}

function cleanTitle(title: string): string {
  return title
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\*+/g, '')
    .replace(/\\+/g, '')
    .trim();
}

function determinePartType(title: string, context: string, section: string, language: string): string {
  const lower = (title + ' ' + context).toLowerCase();

  if (/tesouros|treasures from/i.test(lower) && section === 'treasures') return 'treasures';
  if (/joias espirituais|spiritual gems/i.test(lower)) return 'gems';
  if (/leitura da b[ií]blia|bible reading/i.test(lower)) return 'reading';
  if (/iniciando conversa|starting conversation|primeira conversa|initial call/i.test(lower)) return 'starting';
  if (/cultivando|following up|revisita|return visit/i.test(lower)) return 'following';
  if (/fazendo disc[ií]pulos|making disciples/i.test(lower)) return 'making';
  if (/explicando|explaining/i.test(lower)) return 'explaining';
  if (/discurso|^talk$/i.test(lower)) return 'talk';
  if (/estudo b[ií]blico de congrega[çc][ãa]o|congregation bible study/i.test(lower)) return 'study';

  if (section === 'treasures') {
    if (/joias|gems/i.test(lower)) return 'gems';
    return 'treasures';
  }
  if (section === 'ministry') {
    if (/discurso|talk/i.test(lower)) return 'talk';
    return 'starting';
  }
  if (section === 'living') return 'discussion';

  return 'other';
}

/** Determine current workbook URL from index page */
function findCurrentWorkbookUrl(markdown: string, language: string): string | null {
  const headerPattern = /##\s*\[([^\]]+)\]\(([^)]+mwb[^)]*)\)/g;
  let match;
  const urls: string[] = [];

  while ((match = headerPattern.exec(markdown)) !== null) {
    let url = match[2];
    if (url.startsWith('/')) url = `https://www.jw.org${url}`;
    if (url.includes('mwb/') && !url.includes('Programa') && !url.includes('Schedule')) {
      urls.push(url);
    }
  }

  return urls[0] || null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { language = 'pt' } = await req.json();
    const indexUrl = JW_INDEX_URLS[language] || JW_INDEX_URLS.pt;

    const apiKey = Deno.env.get('FIRECRAWL_API_KEY');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ success: false, error: 'Firecrawl API key not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // STEP 1: Scrape index page to find current workbook
    console.log(`📚 Step 1: Scraping index page: ${indexUrl}`);
    const indexMarkdown = await scrapeUrl(indexUrl, apiKey);
    console.log(`📄 Index page: ${indexMarkdown.length} chars`);

    if (!indexMarkdown) {
      return new Response(
        JSON.stringify({ success: false, error: 'No content from index page' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const workbookUrl = findCurrentWorkbookUrl(indexMarkdown, language);
    let weekEntries = extractWeekUrls(indexMarkdown, language);
    
    // If no weeks found on index, try scraping the first workbook link
    if (weekEntries.length === 0 && workbookUrl) {
      console.log(`📖 Step 1b: Scraping workbook page: ${workbookUrl}`);
      const workbookMarkdown = await scrapeUrl(workbookUrl, apiKey);
      console.log(`📄 Workbook page: ${workbookMarkdown.length} chars`);
      weekEntries = extractWeekUrls(workbookMarkdown, language);
    }

    if (weekEntries.length === 0) {
      console.log('⚠️ No week URLs found');
      return new Response(
        JSON.stringify({ success: true, weeks: [], source: 'firecrawl', fetchedAt: new Date().toISOString() }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🗓️ Found ${weekEntries.length} weeks, scraping up to 4...`);

    // STEP 2: Scrape individual week pages
    const weeksToScrape = weekEntries.slice(0, 4);
    const weeks: ParsedWeek[] = [];

    for (const entry of weeksToScrape) {
      try {
        console.log(`  📄 Scraping: ${entry.weekTitle}`);
        const weekMarkdown = await scrapeUrl(entry.url, apiKey);
        const parsed = parseWeekPage(weekMarkdown, entry.weekTitle, language);
        
        if (parsed.parts.length > 0) {
          weeks.push(parsed);
          console.log(`  ✅ ${entry.weekTitle}: ${parsed.parts.length} parts, bible: "${parsed.bibleReading}", songs: ${parsed.songs.opening}/${parsed.songs.middle}/${parsed.songs.closing}`);
        } else {
          console.log(`  ⚠️ ${entry.weekTitle}: no parts parsed`);
        }
      } catch (err) {
        console.error(`  ❌ Error scraping ${entry.weekTitle}:`, err);
      }
    }

    console.log(`✅ Total: ${weeks.length} weeks parsed`);

    return new Response(
      JSON.stringify({
        success: true,
        weeks,
        source: 'firecrawl',
        fetchedAt: new Date().toISOString(),
        totalWeeksAvailable: weekEntries.length,
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
