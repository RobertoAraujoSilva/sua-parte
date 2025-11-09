import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.79.0';
import * as cheerio from 'https://esm.sh/cheerio@1.0.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

const JW_ORG_URLS = {
  pt: 'https://wol.jw.org/pt/wol/meetings/r5/lp-t',
  en: 'https://wol.jw.org/en/wol/meetings/r1/lp-e',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { language = 'pt' } = await req.json();
    const url = JW_ORG_URLS[language as keyof typeof JW_ORG_URLS] || JW_ORG_URLS.pt;

    console.log(`Fetching JW.org content from: ${url}`);

    // Fetch the HTML content
    const response = await fetch(url);
    const html = await response.text();

    console.log('HTML fetched, parsing content...');

    // Parse the HTML
    const $ = cheerio.load(html);
    const weeks: ParsedWeek[] = [];

    // Find all weekly meeting programs
    $('.todayItems article').each((index, element) => {
      const $article = $(element);
      
      // Extract week date range
      const weekText = $article.find('h2').first().text().trim();
      const dateMatch = weekText.match(/(\d{1,2})[-–](\d{1,2})\s+de\s+(\w+)|([A-Z][a-z]+)\s+(\d{1,2})[-–](\d{1,2})/);
      
      if (!dateMatch) return;

      // Extract bible reading
      const bibleReading = $article.find('p strong').first().text().replace('LEITURA DA BÍBLIA:', '').trim();
      
      // Extract songs
      const songsText = $article.find('p').filter((i, el) => $(el).text().includes('CÂNTICOS') || $(el).text().includes('SONGS')).text();
      const songNumbers = songsText.match(/\d+/g)?.map(Number) || [1, 1, 1];
      
      const songs = {
        opening: songNumbers[0] || 1,
        middle: songNumbers[1] || 1,
        closing: songNumbers[2] || 1,
      };

      // Extract parts
      const parts: ParsedPart[] = [];
      let partId = 1;
      let currentSection = '';

      $article.find('li, h3').each((i, el) => {
        const $el = $(el);
        
        // Check if it's a section header
        if ($el.is('h3')) {
          currentSection = $el.text().trim();
          return;
        }

        const text = $el.text().trim();
        if (!text) return;

        // Extract duration
        const durationMatch = text.match(/\((\d+)\s*min/i);
        const duration = durationMatch ? parseInt(durationMatch[1]) : 0;

        // Extract title (text before duration or colon)
        let title = text.split(/\(|\:/)[0].trim();
        title = title.replace(/^[•●]\s*/, '');

        // Extract description (text after colon or title)
        const descMatch = text.match(/:\s*(.+?)(?:\(|$)/);
        const description = descMatch ? descMatch[1].trim() : '';

        // Extract references
        const refMatch = text.match(/\([^)]*\b(?:th|lff|w\d+|it-\d+|Pro\.|Pr\s+\d+)[^)]*\)/gi) || [];
        const references = refMatch.map(r => r.replace(/[()]/g, '').trim());

        // Determine part type
        let type = 'other';
        const lowerTitle = title.toLowerCase();
        const lowerText = text.toLowerCase();
        
        if (lowerText.includes('tesouros') || lowerText.includes('treasures')) {
          type = 'treasures';
        } else if (lowerTitle.includes('joias') || lowerTitle.includes('gems')) {
          type = 'gems';
        } else if (lowerTitle.includes('leitura') || lowerTitle.includes('reading')) {
          type = 'reading';
        } else if (lowerText.includes('primeira conversa') || lowerText.includes('initial call') || lowerText.includes('iniciando')) {
          type = 'starting';
        } else if (lowerText.includes('revisita') || lowerText.includes('return visit') || lowerText.includes('cultivando')) {
          type = 'following';
        } else if (lowerText.includes('estudo bíblico') && !lowerText.includes('congregação')) {
          type = 'making';
        } else if (lowerText.includes('discurso') || lowerText.includes('talk')) {
          type = 'talk';
        } else if (lowerText.includes('estudo bíblico de congregação') || lowerText.includes('congregation bible study')) {
          type = 'study';
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
      });

      if (parts.length > 0) {
        weeks.push({
          week: weekText,
          dateRange: weekText,
          bibleReading,
          songs,
          parts,
        });
      }
    });

    console.log(`Parsed ${weeks.length} weeks successfully`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        weeks,
        fetchedAt: new Date().toISOString(),
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error fetching JW.org content:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'Failed to fetch content',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
