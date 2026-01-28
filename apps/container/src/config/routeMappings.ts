/**
 * Route to MFE mapping configuration
 * Implements Open/Closed Principle - add new routes without modifying code
 */

export interface RouteMapping {
  /** Route pattern to match */
  pattern: string | RegExp;
  /** MFE name to load */
  mfeName: string;
  /** Whether this is an exact match or prefix match */
  exact?: boolean;
}

/**
 * Configuration for mapping routes to MFEs
 * To add a new route mapping, simply add an entry here
 */
export const routeMappings: RouteMapping[] = [
  { pattern: '/preferences', mfeName: 'preferences', exact: false }, // Matches /preferences/*
  { pattern: '/account', mfeName: 'account', exact: true },
  { pattern: '/admin', mfeName: 'admin', exact: true },
  { pattern: '/', mfeName: 'home', exact: true },
];

/**
 * Get the MFE name for a given route path
 * @param path Current route path
 * @returns MFE name or 'unknown' if no match
 */
export function getMFEForRoute(path: string): string {
  for (const mapping of routeMappings) {
    if (typeof mapping.pattern === 'string') {
      if (mapping.exact) {
        if (path === mapping.pattern) {
          return mapping.mfeName;
        }
      } else {
        // Prefix match
        if (path === mapping.pattern || path.startsWith(mapping.pattern + '/')) {
          return mapping.mfeName;
        }
      }
    } else {
      // RegExp pattern
      if (mapping.pattern.test(path)) {
        return mapping.mfeName;
      }
    }
  }
  return 'unknown';
}
