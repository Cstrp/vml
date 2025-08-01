import type { WhisperConfig } from "./whisper-config";

export interface WhisperState {
  config: WhisperConfig;
  isInitialized: boolean;
}
