import { describe, it, expect, beforeAll } from 'vitest';
import { initializeOpenverse } from './openverse';

const API_KEY = process.env.OPENVERSE_API_KEY || '8qElpRITkvbCtGv8PGfGuA8My5XbTw';

const TEST_PARAMS = {
  q: 'music',
  license: 'cc0',
  page_size: 1,
};

describe('Openverse Service', () => {
  let openverse: Awaited<ReturnType<typeof initializeOpenverse>>;

  beforeAll(async () => {
    openverse = await initializeOpenverse({ apiKey: API_KEY });
  });

  it('fetches audio results from Openverse', async () => {
    if (!API_KEY) {
      console.warn('No OPENVERSE_API_KEY set, skipping test.');
      return;
    }

    const response = await openverse.fetchOpenverseAudio(TEST_PARAMS);

    expect(response).toBeDefined();
    expect(response.results).toBeDefined();
    expect(Array.isArray(response.results)).toBe(true);
    expect(response.results.length).toBeGreaterThan(0);
    expect(response.results[0]).toHaveProperty('title');
    expect(response.results[0]).toHaveProperty('url');
  }, 20000);

  it('fetches rate limit info', async () => {
    if (!API_KEY) {
      console.warn('No OPENVERSE_API_KEY set, skipping test.');
      return;
    }

    const rateLimit = await openverse.getRateLimit();

    expect(rateLimit).toBeDefined();
    expect(rateLimit).toHaveProperty('requests_this_minute');
    expect(rateLimit).toHaveProperty('requests_today');
    expect(rateLimit).toHaveProperty('rate_limit_model');
    expect(rateLimit).toHaveProperty('verified');
  }, 20000);
});
