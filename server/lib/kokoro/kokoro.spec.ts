
import { describe, it, expect, beforeAll } from 'vitest';
import { initializeKokoro } from './kokoro';
import { VoiceEnum } from '../../../shared/types/kokoro/voice';

const TEST_TEXT = 'Hello, this is a test of the Kokoro TTS system.';
const TEST_VOICE = Object.values(VoiceEnum)[0];

describe('Kokoro TTS Service', () => {
  let kokoroResult: Awaited<ReturnType<typeof initializeKokoro>>;

  beforeAll(async () => {
    kokoroResult = await initializeKokoro(TEST_TEXT, TEST_VOICE, { dtype: 'fp16', device: 'cpu' });
  }, 120_000);

  it('should return a valid audio buffer and metadata', () => {
    expect(kokoroResult).toBeDefined();

    expect(kokoroResult).toHaveProperty('audio');
    expect(kokoroResult).toHaveProperty('len');
    expect(typeof kokoroResult.len).toBe('number');

    expect(kokoroResult.len).toBeGreaterThan(0);

    const audioBuf = Buffer.from(kokoroResult.audio);

    expect(Buffer.isBuffer(audioBuf)).toBe(true);
    expect(audioBuf.length).toBeGreaterThan(44); // WAV header size
  });

  it('should accept all defined voices', async () => {
    for (const voice of Object.values(VoiceEnum)) {
      const result = await initializeKokoro(TEST_TEXT, voice, { dtype: 'fp16', device: 'cpu' });

      expect(result).toBeDefined();

      const audioBuf = Buffer.from(result.audio);

      expect(Buffer.isBuffer(audioBuf)).toBe(true);
      expect(audioBuf.length).toBeGreaterThan(44);
    }
  }, 120_000);

  it('should produce different audio for different voices', async () => {
    const allVoices = Object.values(VoiceEnum);

    const otherVoice = allVoices.find(v => v !== TEST_VOICE);

    if (!otherVoice) {
      expect(true).toBe(true);
      return;
    }

    const otherResult = await initializeKokoro(TEST_TEXT, otherVoice, { dtype: 'fp16', device: 'cpu' });

    const buf1 = Buffer.from(otherResult.audio);
    const buf2 = Buffer.from(kokoroResult.audio);

    expect(Buffer.isBuffer(buf1)).toBe(true);
    expect(Buffer.isBuffer(buf2)).toBe(true);

    expect(buf1.length).toBeGreaterThan(44);
    expect(buf2.length).toBeGreaterThan(44);

    expect(Buffer.compare(buf1, buf2)).not.toBe(0);
  }, 120_000);

  it('should produce different audio for different text', async () => {
    const otherText = 'This is a different sentence.';

    const otherResult = await initializeKokoro(otherText, TEST_VOICE, { dtype: 'fp16', device: 'cpu' });

    const buf1 = Buffer.from(otherResult.audio);
    const buf2 = Buffer.from(kokoroResult.audio);

    expect(Buffer.isBuffer(buf1)).toBe(true);
    expect(Buffer.isBuffer(buf2)).toBe(true);

    expect(buf1.length).toBeGreaterThan(44);
    expect(buf2.length).toBeGreaterThan(44);

    expect(Buffer.compare(buf1, buf2)).not.toBe(0);
  }, 120_000);
});
