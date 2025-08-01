export interface FFmpegConfig {
  ffmpegPath?: string;
  quality: {
    mp3Bitrate: number;
    channels: number;
    whisperSampleRate: number;
  };
}
