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
  
  // Pattern: ## [6-12 de julho](URL) or ## [July 6-12](URL)
  const linkPattern = /##\s*\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = linkPattern.exec(markdown)) !== null) {
    const title = match[1].trim();
    let url = match[2].trim();
    
    // Only match actual week links (contain day numbers like "6-12" or "6 de julho")
    // Skip workbook issue titles like "July–August 2026" or "Julho–agosto de 2026"
    const hasDateNumbers = /\d{1,2}[-–]\d{1,2}/.test(title) 
      || /\d{1,2}\s+de\s+\w+/.test(title);
    
    // Exclude workbook titles that have month–month pattern without day numbers
    const isWorkbookTitle = /^[A-Z][a-z]+[–-][A-Z][a-z]+\s+\d{4}$/i.test(title)
      || /^\w+[–-]\w+\s+de\s+\d{4}$/i.test(title);
    
    if (!hasDateNumbers || isWorkbookTitle) continue;
    
    // Also verify URL points to a week schedule page, not a workbook index
    const isScheduleUrl = url.includes('Schedule') || url.includes('Programa') 
      || /\d{1,2}[-–]\d{1,2}/.test(url);

    // Make URL absolute
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

    // Parse numbered parts: "### 1. Title" or "### 1\. Title" followed by "(X min)"
    const numberedPartMatch = line.match(/^#{1,4}\s*(\d+)\\?\.\s*(.+)/);
    if (numberedPartMatch) {
      const partNum = parseInt(numberedPartMatch[1]);
      let title = numberedPartMatch[2].replace(/\*+/g, '').replace(/\[|\]/g, '').trim();
      
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
        if (nextLine.startsWith('Sua resposta')) break;
        if (/^\((\d+)\s*min/.test(nextLine)) {
          // Duration line - extract rest as description
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

      // Determine part type
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

    // Parse "Estudo bíblico de congregação" / "Congregation Bible Study" pattern
    if (/#{1,4}\s*\d+\.\s*(Estudo bíblico de congregação|Congregation Bible Study)/i.test(line)) {
      const durationMatch = line.match(/\((\d+)\s*min\.?\)/i) 
        || lines.slice(i, i + 3).join(' ').match(/\((\d+)\s*min\.?\)/i);
      
      parts.push({
        id: partId++,
        title: language === 'pt' ? 'Estudo bíblico de congregação' : 'Congregation Bible Study',
        duration: durationMatch ? parseInt(durationMatch[1]) : 30,
        type: 'study',
        description: lines.slice(i, i + 3).join(' ').replace(/#{1,4}\s*\d+\.\s*/, '').replace(/\*+/g, '').trim(),
        references: [],
        section: 'living',
      });
    }

    // Extract Bible reading reference from the treasures section content
    if (currentSection === 'treasures' && /Leitura da Bíblia|Bible Reading/i.test(line)) {
      const brMatch = lines.slice(i, i + 3).join(' ').match(/\[([^\]]*(?:Jer|Gen|Exo|Lev|Num|Deu|Jos|Jud|Rut|Sam|Rei|Crô|Esd|Nee|Est|Jó|Sal|Pro|Ecl|Isa|Eze|Dan|Ose|Joe|Amó|Oba|Jon|Miq|Nau|Hab|Sof|Ag|Zac|Mal|Mat|Mar|Luc|João|At|Rom|Cor|Gal|Efé|Fil|Col|Tes|Tim|Tit|File|Heb|Tia|Ped|Jud|Apo)[^\]]*)\]/i);
      if (brMatch) {
        bibleReading = brMatch[1].trim();
      }
    }
  }

  // Also check for "Comentários finais" / "Concluding Comments" as last part
  const concludingMatch = markdown.match(/Coment[aá]rios finais\s*\((\d+)\s*min\.?\)|Concluding Comments\s*\((\d+)\s*min\.?\)/i);
  // We don't add this as a separate part since it's standard

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
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // Remove markdown links
    .replace(/\*+/g, '') // Remove bold/italic
    .replace(/\\+/g, '') // Remove backslashes
    .trim();
}

function determinePartType(title: string, context: string, section: string, language: string): string {
  const lower = (title + ' ' + context).toLowerCase();

  if (/tesouros|treasures from/i.test(lower) && section === 'treasures') return 'treasures';
  if (/joias espirituais|spiritual gems/i.test(lower)) return 'gems';
  if (/leitura da b[ií]blia|bible reading/i.test(lower)) return 'reading';
  if (/iniciando conversa|starting conversation|primeira conversa|initial call/i.test(lower)) return 'starting';
  if (/cultivando|making return|revisita|return visit/i.test(lower)) return 'following';
  if (/fazendo disc[ií]pulos|making disciples/i.test(lower)) return 'making';
  if (/explicando|explaining/i.test(lower)) return 'explaining';
  if (/discurso(?! bíblico)|^talk$/i.test(lower)) return 'talk';
  if (/estudo b[ií]blico de congrega[çc][ãa]o|congregation bible study/i.test(lower)) return 'study';

  // Fallback based on section
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
  // Look for workbook links - the first one is usually the most recent/current
  const pattern = language === 'pt'
    ? /\[([^\]]*\d{4}[^\]]*)\]\((https:\/\/www\.jw\.org\/pt\/biblioteca\/jw-apostila-do-mes\/[^\s)]+)\)/g
    : /\[([^\]]*\d{4}[^\]]*)\]\((https:\/\/www\.jw\.org\/en\/library\/jw-meeting-workbook\/[^\s)]+)\)/g;

  // Also match relative paths from ## headers
  const headerPattern = /##\s*\[([^\]]+)\]\(([^)]+mwb[^)]*)\)/g;
  
  let match;
  const urls: string[] = [];

  while ((match = headerPattern.exec(markdown)) !== null) {
    let url = match[2];
    if (url.startsWith('/')) url = `https://www.jw.org${url}`;
    // Only include workbook issue pages (not individual week pages)
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

    // STEP 1: Scrape the index page to find the current workbook
    console.log(`📚 Step 1: Scraping index page: ${indexUrl}`);
    const indexMarkdown = await scrapeUrl(indexUrl, apiKey);
    console.log(`📄 Index page: ${indexMarkdown.length} chars`);

    if (!indexMarkdown) {
      return new Response(
        JSON.stringify({ success: false, error: 'No content from index page' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Find the current workbook URL from index
    const workbookUrl = findCurrentWorkbookUrl(indexMarkdown, language);
    
    // Try to extract week URLs directly from index (if it's a workbook page already)
    let weekEntries = extractWeekUrls(indexMarkdown, language);
    
    // If no weeks found on index, try scraping the first workbook link
    if (weekEntries.length === 0 && workbookUrl) {
      console.log(`📖 Step 1b: Scraping workbook page: ${workbookUrl}`);
      const workbookMarkdown = await scrapeUrl(workbookUrl, apiKey);
      console.log(`📄 Workbook page: ${workbookMarkdown.length} chars`);
      weekEntries = extractWeekUrls(workbookMarkdown, language);
    }

    if (weekEntries.length === 0) {
      console.log('⚠️ No week URLs found in index/workbook pages');
      return new Response(
        JSON.stringify({ success: true, weeks: [], source: 'firecrawl', fetchedAt: new Date().toISOString(), debug: 'No week URLs found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`🗓️ Found ${weekEntries.length} weeks, scraping up to 4...`);

    // STEP 2: Scrape individual week pages (limit to first 4 for performance)
    const weeksToScrape = weekEntries.slice(0, 4);
    const weeks: ParsedWeek[] = [];

    for (const entry of weeksToScrape) {
      try {
        console.log(`  📄 Scraping week: ${entry.weekTitle} → ${entry.url}`);
        const weekMarkdown = await scrapeUrl(entry.url, apiKey);
        const parsed = parseWeekPage(weekMarkdown, entry.weekTitle, language);
        
        if (parsed.parts.length > 0) {
          weeks.push(parsed);
          console.log(`  ✅ ${entry.weekTitle}: ${parsed.parts.length} parts, songs: ${parsed.songs.opening}/${parsed.songs.middle}/${parsed.songs.closing}`);
        } else {
          console.log(`  ⚠️ ${entry.weekTitle}: no parts parsed`);
        }
      } catch (err) {
        console.error(`  ❌ Error scraping ${entry.weekTitle}:`, err);
      }
    }

    console.log(`✅ Total: ${weeks.length} weeks parsed successfully`);

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
