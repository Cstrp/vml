import type { KokoroConfig } from "./kokoro-config";

// Mock interface to replace kokoro-js dependency
interface MockKokoroTTS {
  list_voices(): Record<string, { name: string; language: string; gender: string }>;
  generate(text: string, options: { voice: string; speed?: number }): Promise<{ save: (filename: string) => void; buffer: ArrayBuffer }>;
}

export interface KokoroState {
  tts: MockKokoroTTS;
  config: KokoroConfig;
  isInitialized: boolean;
}
