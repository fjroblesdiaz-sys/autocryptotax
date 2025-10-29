/**
 * Cache Manager
 * Manages localStorage cache for reports
 * Automatically cleans old and invalid data
 */

const CACHE_VERSION = '3.0'; // Bumped to force complete cache clear
const MAX_REPORTS = 3;
const MAX_AGE_HOURS = 24;

/**
 * Initialize cache manager
 * Call this on app startup to clean old data
 */
export function initializeCacheManager() {
  if (typeof window === 'undefined') return;

  try {
    console.log('[CacheManager] Initializing...');
    
    // Check if we need to clear all old cache (version mismatch)
    const cacheVersion = localStorage.getItem('cache_version');
    if (cacheVersion !== CACHE_VERSION) {
      console.log('[CacheManager] Version mismatch, clearing all old reports');
      clearAllReports();
      localStorage.setItem('cache_version', CACHE_VERSION);
    }
    
    // Clean old reports on startup
    cleanOldReports();
    
    console.log('[CacheManager] Initialized successfully');
  } catch (error) {
    console.error('[CacheManager] Initialization error:', error);
  }
}

/**
 * Clean old reports from localStorage
 * Keeps only the most recent reports
 */
export function cleanOldReports() {
  try {
    const reportKeys: { key: string; timestamp: number; version?: string }[] = [];
    const maxAge = MAX_AGE_HOURS * 60 * 60 * 1000;
    const now = Date.now();
    
    // Find all report keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('report_')) {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          
          // Check if report is too old or wrong version
          const age = now - (data.timestamp || 0);
          if (age > maxAge || data.version !== CACHE_VERSION) {
            localStorage.removeItem(key);
            console.log('[CacheManager] Removed stale/outdated report:', key);
            continue;
          }
          
          reportKeys.push({
            key,
            timestamp: data.timestamp || 0,
            version: data.version,
          });
        } catch (e) {
          // Invalid data, delete it
          localStorage.removeItem(key);
          console.log('[CacheManager] Removed invalid report:', key);
        }
      }
    }
    
    // Sort by timestamp (newest first)
    reportKeys.sort((a, b) => b.timestamp - a.timestamp);
    
    // Keep only the most recent reports, delete the rest
    if (reportKeys.length > MAX_REPORTS) {
      const toDelete = reportKeys.slice(MAX_REPORTS);
      toDelete.forEach(({ key }) => {
        localStorage.removeItem(key);
      });
      console.log('[CacheManager] Removed', toDelete.length, 'excess reports');
    }
    
    console.log('[CacheManager] Active reports:', reportKeys.length);
  } catch (error) {
    console.error('[CacheManager] Error cleaning reports:', error);
  }
}

/**
 * Clear all reports from localStorage
 */
export function clearAllReports() {
  try {
    const keys: string[] = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('report_')) {
        keys.push(key);
      }
    }
    
    keys.forEach(key => localStorage.removeItem(key));
    console.log('[CacheManager] Cleared all reports:', keys.length);
    
    // Also clear cache version to force reinit
    localStorage.removeItem('cache_version');
  } catch (error) {
    console.error('[CacheManager] Error clearing all reports:', error);
  }
}

/**
 * Clear all caches including IndexedDB
 * Call this from browser console to completely reset
 */
export async function clearAllCaches() {
  try {
    // Clear localStorage reports
    clearAllReports();
    
    // Clear IndexedDB
    if (typeof window !== 'undefined' && 'indexedDB' in window) {
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.deleteDatabase('AutoCryptoTaxCache');
        request.onsuccess = () => {
          console.log('[CacheManager] IndexedDB cleared');
          resolve();
        };
        request.onerror = () => reject(request.error);
        request.onblocked = () => {
          console.warn('[CacheManager] IndexedDB deletion blocked, close all tabs');
          resolve();
        };
      });
    }
    
    console.log('[CacheManager] ✅ ALL CACHES CLEARED - Please refresh the page');
  } catch (error) {
    console.error('[CacheManager] Error clearing caches:', error);
  }
}

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  (window as any).clearAllCaches = clearAllCaches;
}

/**
 * Get report from cache with validation
 */
export function getReportFromCache(reportId: string) {
  try {
    const stored = localStorage.getItem(`report_${reportId}`);
    if (!stored) return null;
    
    const data = JSON.parse(stored);
    
    // Validate version
    if (data.version !== CACHE_VERSION) {
      localStorage.removeItem(`report_${reportId}`);
      return null;
    }
    
    // Check age
    const age = Date.now() - (data.timestamp || 0);
    const maxAge = MAX_AGE_HOURS * 60 * 60 * 1000;
    if (age > maxAge) {
      localStorage.removeItem(`report_${reportId}`);
      return null;
    }
    
    return data;
  } catch (error) {
    console.error('[CacheManager] Error getting report:', error);
    return null;
  }
}

/**
 * Save report to cache
 */
export function saveReportToCache(reportId: string, data: any) {
  try {
    // Clean old reports first
    cleanOldReports();
    
    // Save with metadata
    localStorage.setItem(`report_${reportId}`, JSON.stringify({
      version: CACHE_VERSION,
      timestamp: Date.now(),
      ...data,
    }));
    
    console.log('[CacheManager] Report saved:', reportId);
  } catch (error) {
    console.error('[CacheManager] Error saving report:', error);
  }
}

/**
 * Save PDF blob to cache (IndexedDB for large files)
 * localStorage can't handle large binary data, so we use IndexedDB
 */
export async function savePDFToCache(reportId: string, blob: Blob): Promise<void> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return;

  try {
    const db = await openDB();
    const transaction = db.transaction(['pdfs'], 'readwrite');
    const store = transaction.objectStore('pdfs');
    
    const request = store.put({
      id: reportId,
      blob,
      timestamp: Date.now(),
      version: CACHE_VERSION,
    });

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        console.log('[CacheManager] PDF cached:', reportId);
        resolve();
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[CacheManager] Error saving PDF:', error);
  }
}

/**
 * Get PDF blob from cache
 */
export async function getPDFFromCache(reportId: string): Promise<Blob | null> {
  if (typeof window === 'undefined' || !('indexedDB' in window)) return null;

  try {
    const db = await openDB();
    const transaction = db.transaction(['pdfs'], 'readonly');
    const store = transaction.objectStore('pdfs');
    const request = store.get(reportId);

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        const result = request.result;
        if (result && result.version === CACHE_VERSION) {
          // Check age
          const age = Date.now() - (result.timestamp || 0);
          const maxAge = MAX_AGE_HOURS * 60 * 60 * 1000;
          if (age > maxAge) {
            console.log('[CacheManager] PDF cache expired');
            resolve(null);
          } else {
            resolve(result.blob);
          }
        } else {
          resolve(null);
        }
      };
      request.onerror = () => reject(request.error);
    });
  } catch (error) {
    console.error('[CacheManager] Error getting PDF:', error);
    return null;
  }
}

/**
 * Open IndexedDB for PDF storage
 */
function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('AutoCryptoTaxCache', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('pdfs')) {
        db.createObjectStore('pdfs', { keyPath: 'id' });
      }
    };
  });
}

