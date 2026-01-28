import { useState, useEffect } from 'react';

/**
 * Custom hook to manage MFE mounting lifecycle
 * Implements Single Responsibility Principle - only handles MFE mounting logic
 * 
 * @param currentMFE Current active MFE name
 * @returns Set of mounted MFE names
 */
export function useMFEMounting(currentMFE: string): Set<string> {
  const [mountedMFEs, setMountedMFEs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (currentMFE !== 'unknown' && !mountedMFEs.has(currentMFE)) {
      setMountedMFEs(prev => new Set(prev).add(currentMFE));
    }
  }, [currentMFE, mountedMFEs]);

  return mountedMFEs;
}
