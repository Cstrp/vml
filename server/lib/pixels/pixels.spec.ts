import { describe, it, expect, beforeAll } from 'vitest';
import { initializePixels } from './pixels';

// You should set your Pexels API key in the environment for this test to work
const API_KEY = process.env.PEXELS_API_KEY || '5fqJnhJQegVeMGZBl4uuekmFTHpY2TUIw9XlOrTygp97f0R6snIWkZfz';

const TEST_QUERY = 'nature';
const TEST_ORIENTATION = 'landscape';
const TEST_EXCLUDE_IDS: string[] = [];
const TEST_MIN_DURATION = 5;
const TEST_TIMEOUT = 15000;

describe('Pixels Service', () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let fetchPixelsVideo: any

  beforeAll(async () => {
    const service = await initializePixels({ apiKey: API_KEY });
    fetchPixelsVideo = service.fetchPixelsVideo;
  });

  it('fetches a suitable video from Pexels', async () => {
    if (!API_KEY) {
      console.warn('No PEXELS_API_KEY set, skipping test.');
      return;
    }

    const video = await fetchPixelsVideo({
      q: TEST_QUERY,
      orientation: TEST_ORIENTATION,
      excludeIds: TEST_EXCLUDE_IDS,
      minDurationSeconds: TEST_MIN_DURATION,
      timeout: TEST_TIMEOUT,
    });

    expect(video).toBeDefined();

    expect(video).toHaveProperty('id');
    expect(video).toHaveProperty('url');
    expect(video).toHaveProperty('width');
    expect(video).toHaveProperty('height');
    expect(typeof video.url).toBe('string');

    expect(video.width).toBeGreaterThan(0);
    expect(video.height).toBeGreaterThan(0);
  }, 30000);
});
