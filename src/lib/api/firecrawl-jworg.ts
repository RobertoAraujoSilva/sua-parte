import { supabase } from '@/integrations/supabase/client';
import { FunctionsHttpError } from '@supabase/supabase-js';

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
    const details = error instanceof FunctionsHttpError ? await error.context.text() : error.message;
    return { success: false, error: details };
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
  try {
    const firecrawlResult = await fetchViaFirecrawl(language);
    if (firecrawlResult.success && firecrawlResult.weeks && firecrawlResult.weeks.length > 0) {
      return firecrawlResult;
    }
    return { success: false, error: firecrawlResult.error || 'Nenhuma semana extraída da apostila atual.' };
  } catch (err) {
    return { success: false, error: err instanceof Error ? err.message : 'Não foi possível importar a apostila atual pelo Firecrawl.' };
  }
}
