/**
 * Remote Module Loader
 * 
 * Dynamically loads remote JavaScript modules from URLs.
 * Used for loading MFEs from their deployed S3/CloudFront locations.
 */

interface RemoteModuleCache {
  [url: string]: Promise<any>;
}

const moduleCache: RemoteModuleCache = {};

/**
 * Load a remote ES module from a URL
 * @param url - The URL of the remote module to load
 * @returns Promise resolving to the module exports
 */
export const loadRemoteModule = async (url: string): Promise<any> => {
  // Return cached promise if already loading/loaded
  if (moduleCache[url] !== undefined) {
    return moduleCache[url];
  }

  // Create and cache the loading promise using dynamic import
  const loadPromise = import(/* @vite-ignore */ url)
    .catch(error => {
      // Remove from cache on error so retry is possible
      delete moduleCache[url];
      throw new Error(`Failed to load remote module from ${url}: ${error.message}`);
    });

  moduleCache[url] = loadPromise;
  return loadPromise;
};

/**
 * Check if a URL is accessible
 * @param url - The URL to check
 * @returns Promise resolving to true if accessible, false otherwise
 */
export const checkRemoteUrl = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, { method: 'HEAD', mode: 'cors' });
    return response.ok;
  } catch {
    return false;
  }
};

/**
 * Clear the module cache for a specific URL or all URLs
 * @param url - Optional URL to clear, if not provided clears all
 */
export const clearModuleCache = (url?: string): void => {
  if (url) {
    delete moduleCache[url];
  } else {
    Object.keys(moduleCache).forEach(key => delete moduleCache[key]);
  }
};
