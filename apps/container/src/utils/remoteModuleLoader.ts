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


