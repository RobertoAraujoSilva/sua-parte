/**
 * Network Detection Utility
 * 
 * Provides type-safe, cross-browser compatible network condition detection
 * with proper fallbacks and SSR safety.
 */

// Type definitions for the experimental Network Information API
interface NetworkInformation extends EventTarget {
  readonly effectiveType: '2g' | '3g' | '4g' | 'slow-2g';
  readonly downlink: number;
  readonly rtt: number;
  readonly saveData: boolean;
  onchange: ((this: NetworkInformation, ev: Event) => any) | null;
}

interface NavigatorWithConnection extends Navigator {
  connection?: NetworkInformation;
  mozConnection?: NetworkInformation;
  webkitConnection?: NetworkInformation;
}

export type NetworkCondition = '2g' | '3g' | '4g' | 'slow-2g' | 'unknown' | 'offline';

export interface NetworkStatus {
  condition: NetworkCondition;
  isOnline: boolean;
  isSupported: boolean;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
}

/**
 * Safely detects if we're in a browser environment
 */
function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof navigator !== 'undefined';
}

/**
 * Gets the network connection object with vendor prefixes
 */
function getConnection(): NetworkInformation | undefined {
  if (!isBrowser()) return undefined;
  
  const nav = navigator as NavigatorWithConnection;
  return nav.connection || nav.mozConnection || nav.webkitConnection;
}

/**
 * Detects current network condition with proper fallbacks
 */
export function detectNetworkCondition(): NetworkStatus {
  // Default offline status for SSR
  if (!isBrowser()) {
    return {
      condition: 'unknown',
      isOnline: false,
      isSupported: false
    };
  }

  const isOnline = navigator.onLine;
  
  // If offline, return offline status
  if (!isOnline) {
    return {
      condition: 'offline',
      isOnline: false,
      isSupported: true
    };
  }

  const connection = getConnection();
  
  // If Network Information API is not supported, use basic online detection
  if (!connection) {
    return {
      condition: 'unknown',
      isOnline: true,
      isSupported: false
    };
  }

  // Return detailed network information
  return {
    condition: connection.effectiveType || 'unknown',
    isOnline: true,
    isSupported: true,
    downlink: connection.downlink,
    rtt: connection.rtt,
    saveData: connection.saveData
  };
}

/**
 * Gets adaptive timeout based on network conditions
 */
export function getAdaptiveTimeout(baseTimeout: number = 15000): number {
  const networkStatus = detectNetworkCondition();
  
  // If offline, use a longer timeout for potential reconnection
  if (networkStatus.condition === 'offline') {
    return baseTimeout * 2;
  }
  
  // Adjust timeout based on network conditions
  switch (networkStatus.condition) {
    case 'slow-2g':
      return baseTimeout * 2; // 30 seconds for very slow connections
    case '2g':
      return Math.round(baseTimeout * 1.67); // 25 seconds for slow connections
    case '3g':
      return Math.round(baseTimeout * 1.33); // 20 seconds for moderate connections
    case '4g':
      return baseTimeout; // 15 seconds for fast connections
    default:
      return Math.round(baseTimeout * 1.33); // Default to 20 seconds for unknown conditions
  }
}

/**
 * Creates a network status listener with proper cleanup
 */
export function createNetworkStatusListener(
  callback: (status: NetworkStatus) => void
): () => void {
  if (!isBrowser()) {
    return () => {}; // No-op for SSR
  }

  const handleOnlineChange = () => {
    callback(detectNetworkCondition());
  };

  const handleConnectionChange = () => {
    callback(detectNetworkCondition());
  };

  // Listen for online/offline events
  window.addEventListener('online', handleOnlineChange);
  window.addEventListener('offline', handleOnlineChange);

  // Listen for connection changes if supported
  const connection = getConnection();
  if (connection) {
    connection.addEventListener('change', handleConnectionChange);
  }

  // Return cleanup function
  return () => {
    window.removeEventListener('online', handleOnlineChange);
    window.removeEventListener('offline', handleOnlineChange);
    
    if (connection) {
      connection.removeEventListener('change', handleConnectionChange);
    }
  };
}

/**
 * Hook-like function for getting network status with logging
 */
export function getNetworkStatusWithLogging(): NetworkStatus {
  const status = detectNetworkCondition();
  
  if (isBrowser()) {
    console.log(`📶 Network status: ${status.condition}, online: ${status.isOnline}, supported: ${status.isSupported}`);
    
    if (status.isSupported && status.downlink !== undefined) {
      console.log(`📊 Network details: downlink: ${status.downlink}Mbps, rtt: ${status.rtt}ms, saveData: ${status.saveData}`);
    }
  }
  
  return status;
}
