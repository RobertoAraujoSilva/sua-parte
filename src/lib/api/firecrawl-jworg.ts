import { supabase } from '@/integrations/supabase/client';

export interface FirecrawlJWorgResponse {
  success: boolean;
  weeks?: any[];
  source?: string;
  error?: string;
  fetchedAt?: string;
}

/**
 * Fetches JW.org meeting content using Firecrawl (primary source).
 */
export async function fetchViaFirecrawl(language: 'pt' | 'en'): Promise<FirecrawlJWorgResponse> {
  const { data, error } = await supabase.functions.invoke('firecrawl-jworg', {
    body: { language },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data as FirecrawlJWorgResponse;
}

/**
 * Fetches JW.org meeting content using Cheerio fallback.
 */
export async function fetchViaCheerio(language: 'pt' | 'en'): Promise<FirecrawlJWorgResponse> {
  const { data, error } = await supabase.functions.invoke('fetch-jworg-content', {
    body: { language },
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return data as FirecrawlJWorgResponse;
}

/**
 * Fetches JW.org content with fallback chain: Firecrawl → Cheerio → null.
 */
export async function fetchJWorgContent(language: 'pt' | 'en'): Promise<FirecrawlJWorgResponse> {
  // 1. Try Firecrawl
  console.log('🔥 Trying Firecrawl...');
  try {
    const firecrawlResult = await fetchViaFirecrawl(language);
    if (firecrawlResult.success && firecrawlResult.weeks && firecrawlResult.weeks.length > 0) {
      console.log(`✅ Firecrawl returned ${firecrawlResult.weeks.length} weeks`);
      return firecrawlResult;
    }
    console.warn('⚠️ Firecrawl returned no weeks, falling back...');
  } catch (err) {
    console.warn('⚠️ Firecrawl failed:', err);
  }

  // 2. Fallback to Cheerio
  console.log('📡 Trying Cheerio fallback...');
  try {
    const cheerioResult = await fetchViaCheerio(language);
    if (cheerioResult.success && cheerioResult.weeks && cheerioResult.weeks.length > 0) {
      console.log(`✅ Cheerio returned ${cheerioResult.weeks.length} weeks`);
      return { ...cheerioResult, source: 'cheerio' };
    }
    console.warn('⚠️ Cheerio returned no weeks');
  } catch (err) {
    console.warn('⚠️ Cheerio failed:', err);
  }

  // 3. No data available
  return { success: false, error: 'All sources failed (Firecrawl + Cheerio)' };
}
