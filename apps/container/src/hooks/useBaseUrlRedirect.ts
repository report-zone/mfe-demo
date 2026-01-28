import { useEffect } from 'react';

/**
 * Custom hook to handle base URL redirects
 * Implements Single Responsibility Principle - only handles redirects
 */
export function useBaseUrlRedirect(): void {
  useEffect(() => {
    // Check if we're at root URL but app expects to be at /container/
    // This handles the case where CloudFront serves /container/index.html for root requests
    const expectedBase = import.meta.env.BASE_URL || '/';
    const currentPath = window.location.pathname;
    
    // If we're at root but app expects /container/, redirect
    if (expectedBase === '/container/' && currentPath === '/') {
      window.location.replace(expectedBase);
    }
  }, []);
}
