import { describe, it, expect, beforeAll } from 'vitest';
import { initializeFFmpeg } from './ffmpeg';
import fs from 'fs';
import path from 'path';

const TEST_WAV = path.join(__dirname, 'test_speech.wav');
const TEST_MP3 = path.join(__dirname, 'test.mp3');
const TEST_MP3_OUT = path.join(__dirname, 'test_output.mp3');

function loadAudioBuffer(filePath: string): ArrayBuffer {
  const buffer = fs.readFileSync(filePath);
  return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
}

describe('FFmpeg Service', () => {
  let ffmpegService: Awaited<ReturnType<typeof initializeFFmpeg>>;
  let audioBuffer: ArrayBuffer;

  beforeAll(async () => {
    ffmpegService = await initializeFFmpeg();

    if (!fs.existsSync(TEST_WAV)) {
      throw new Error('Missing test.wav file for FFmpeg tests');
    }

    audioBuffer = loadAudioBuffer(TEST_WAV);
  }, 30000);

  it('normalizes audio and saves as WAV', async () => {
    const outPath = path.join(__dirname, 'normalized.wav');

    await ffmpegService.saveNormalizedAudio(audioBuffer, outPath);

    expect(fs.existsSync(outPath)).toBe(true);

    const stats = fs.statSync(outPath);

    expect(stats.size).toBeGreaterThan(44);

    fs.unlinkSync(outPath);
  }, 30000);

  it('creates an MP3 data URI', async () => {
    const dataUri = await ffmpegService.createMP3DataUri(audioBuffer, TEST_MP3);

    expect(typeof dataUri).toBe('string');

    expect(dataUri.startsWith('data:audio/mp3;base64,')).toBe(true);
  }, 30000);

  it('saves audio as MP3', async () => {
    await ffmpegService.saveToMP3(audioBuffer, TEST_MP3_OUT);

    expect(fs.existsSync(TEST_MP3_OUT)).toBe(true);

    const stats = fs.statSync(TEST_MP3_OUT);

    expect(stats.size).toBeGreaterThan(1000);

    fs.unlinkSync(TEST_MP3_OUT);
  }, 30000);

  it('throws on invalid audio input', async () => {
    const invalidBuffer = new ArrayBuffer(10);
    await expect(ffmpegService.saveNormalizedAudio(invalidBuffer, 'fail.wav')).rejects.toThrow();

    await expect(ffmpegService.createMP3DataUri(invalidBuffer, 'fail.mp3')).rejects.toThrow();

    await expect(ffmpegService.saveToMP3(invalidBuffer, 'fail.mp3')).rejects.toThrow();
  }, 30000);
});
