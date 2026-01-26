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

  // Create and cache the loading promise
  const loadPromise = new Promise((resolve, reject) => {
    // Create a script element for the module
    const script = document.createElement('script');
    script.type = 'module';
    script.crossOrigin = 'anonymous';
    
    // Generate a unique callback name for this module
    const callbackName = `__remoteModuleCallback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create inline script that imports and exposes the module
    const inlineScript = `
      import * as module from '${url}';
      window.${callbackName} = module;
    `;
    
    script.textContent = inlineScript;
    
    // Handle successful load
    const checkInterval = setInterval(() => {
      if ((window as any)[callbackName]) {
        clearInterval(checkInterval);
        const module = (window as any)[callbackName];
        delete (window as any)[callbackName];
        document.head.removeChild(script);
        resolve(module);
      }
    }, 10);
    
    // Handle errors
    script.onerror = () => {
      clearInterval(checkInterval);
      document.head.removeChild(script);
      reject(new Error(`Failed to load remote module: ${url}`));
    };
    
    // Timeout after 30 seconds
    setTimeout(() => {
      if ((window as any)[callbackName]) {
        clearInterval(checkInterval);
        delete (window as any)[callbackName];
        document.head.removeChild(script);
        reject(new Error(`Timeout loading remote module: ${url}`));
      }
    }, 30000);
    
    // Add script to document
    document.head.appendChild(script);
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
