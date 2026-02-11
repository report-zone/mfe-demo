/**
 * API Configuration
 *
 * Provides base URL configuration that supports both HTTP (dev) and HTTPS (prod).
 * Uses environment variables to determine the appropriate protocol and host.
 *
 * Environment Variables:
 *   VITE_API_BASE_URL - Full base URL override (e.g., "https://api.example.com")
 *   VITE_API_HOST     - API host (e.g., "api.example.com")
 *   VITE_API_PORT     - API port (e.g., "3000")
 *   VITE_API_PROTOCOL - Protocol override ("http" or "https")
 */

export interface ApiConfig {
  baseUrl: string;
  protocol: 'http' | 'https';
  host: string;
  port?: string;
}

// Vite injects import.meta.env at build time for apps;
// this helper avoids TypeScript errors when compiled outside Vite.
const getViteEnv = (): Record<string, string | boolean | undefined> => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (import.meta as any).env ?? {};
  } catch {
    return {};
  }
};

const isProduction = (): boolean => {
  const env = getViteEnv();
  if (env.PROD !== undefined) return env.PROD === true;
  return typeof process !== 'undefined' && process.env?.NODE_ENV === 'production';
};

const getEnvVar = (key: string, fallback = ''): string => {
  const env = getViteEnv();
  return (env[key] as string) || fallback;
};

export const getApiConfig = (): ApiConfig => {
  // Allow full base URL override
  const baseUrlOverride = getEnvVar('VITE_API_BASE_URL');
  if (baseUrlOverride) {
    const url = new URL(baseUrlOverride);
    return {
      baseUrl: baseUrlOverride.replace(/\/$/, ''),
      protocol: url.protocol.replace(':', '') as 'http' | 'https',
      host: url.hostname,
      port: url.port || undefined,
    };
  }

  const prod = isProduction();
  const protocol = (getEnvVar('VITE_API_PROTOCOL') || (prod ? 'https' : 'http')) as
    | 'http'
    | 'https';
  const host = getEnvVar('VITE_API_HOST', 'localhost');
  const port = getEnvVar('VITE_API_PORT', prod ? '' : '3000');

  const portSuffix = port ? `:${port}` : '';
  const baseUrl = `${protocol}://${host}${portSuffix}`;

  return { baseUrl, protocol, host, port: port || undefined };
};

export const apiConfig = getApiConfig();
