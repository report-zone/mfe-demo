import { describe, it, expect } from 'vitest';
import { getApiConfig } from '../apiConfig';

describe('apiConfig', () => {
  it('should return a valid config object', () => {
    const config = getApiConfig();
    expect(config).toBeDefined();
    expect(config.baseUrl).toBeDefined();
    expect(config.protocol).toMatch(/^https?$/);
    expect(config.host).toBeDefined();
  });

  it('should default to http in non-production', () => {
    const config = getApiConfig();
    expect(config.protocol).toBe('http');
    expect(config.baseUrl).toContain('http://');
  });

  it('should default to localhost when no host is configured', () => {
    const config = getApiConfig();
    expect(config.host).toBe('localhost');
  });

  it('should include port 3000 by default in non-production', () => {
    const config = getApiConfig();
    expect(config.port).toBe('3000');
    expect(config.baseUrl).toContain(':3000');
  });
});
