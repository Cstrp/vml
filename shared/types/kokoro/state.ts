import type { KokoroConfig } from "./kokoro-config";
import { KokoroTTS } from "kokoro-js";

export interface KokoroState {
  tts: KokoroTTS;
  config: KokoroConfig;
  isInitialized: boolean;
}
