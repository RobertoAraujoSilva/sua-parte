// Basic offline cache system using localStorage

const CACHE_PREFIX = 'sua_parte_cache_';
const CACHE_EXPIRY = 24 * 60 * 60 * 1000; // 24 hours

interface CacheItem {
  data: any;
  timestamp: number;
  expiry: number;
}

export const cacheSet = (key: string, data: any, customExpiry?: number): void => {
  const expiry = customExpiry || CACHE_EXPIRY;
  const item: CacheItem = {
    data,
    timestamp: Date.now(),
    expiry: Date.now() + expiry
  };
  
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(item));
  } catch (error) {
    console.warn('Cache storage failed');
  }
};

export const cacheGet = (key: string): any | null => {
  try {
    const cached = localStorage.getItem(CACHE_PREFIX + key);
    if (!cached) return null;
    
    const item: CacheItem = JSON.parse(cached);
    
    if (Date.now() > item.expiry) {
      localStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    
    return item.data;
  } catch (error) {
    return null;
  }
};

export const cacheRemove = (key: string): void => {
  localStorage.removeItem(CACHE_PREFIX + key);
};

export const cacheClear = (): void => {
  Object.keys(localStorage)
    .filter(key => key.startsWith(CACHE_PREFIX))
    .forEach(key => localStorage.removeItem(key));
};

export const isOnline = (): boolean => {
  return navigator.onLine;
};