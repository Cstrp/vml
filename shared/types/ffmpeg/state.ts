import type { FFmpegConfig } from "./ffmpeg-config";

export interface FFmpegState {
  isInitialized: boolean;
  config: FFmpegConfig;
  ffmpegPath: string;
}
