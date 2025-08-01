import type { WhisperModel } from "./whisper-model";

export interface WhisperConfig {
  runningInDocker: boolean;
  whisperInstallPath: string;
  whisperVersion: string;
  whisperModel: WhisperModel;
  whisperVerbose: boolean;
}
