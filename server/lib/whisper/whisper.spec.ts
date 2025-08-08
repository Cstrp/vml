import { initializeWhisper, transcribe } from './whisper';
import { describe, it, expect, beforeAll } from 'vitest';
import { existsSync } from 'fs';
import { join } from 'path';

const TEST_MODEL = 'Xenova/whisper-tiny';
const TEST_AUDIO = join(__dirname, './test_speech.wav');

describe('Whisper', () => {
  beforeAll(async () => {
    await initializeWhisper({ model: TEST_MODEL });
  }, 120_000);

  it('transcribes speech and validates result structure', async () => {
    expect(existsSync(TEST_AUDIO)).toBe(true);

    const result = await transcribe(TEST_AUDIO, { model: TEST_MODEL });

    expect(result).toBeDefined();

    expect(Array.isArray(result)).toBe(true);

    expect(result.length).toBeGreaterThan(0);

    for (const segment of result) {
      expect(segment).toHaveProperty('text');

      expect(typeof segment.text).toBe('string');

      expect(segment.text.length).toBeGreaterThan(0);

      expect(segment).toHaveProperty('start');

      expect(typeof segment.start).toBe('number');

      expect(segment).toHaveProperty('end');

      expect(typeof segment.end).toBe('number');

      if ('language' in segment) {
        expect(typeof segment.language).toBe('string');
      }
    }

    const fullText = result.map(s => s.text).join(' ').toLowerCase();

    expect(fullText).toMatch(/college|papers|paper|writes|something/);

  }, 120_000);
});
