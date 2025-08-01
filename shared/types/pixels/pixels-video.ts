import type { PexelsVideoFile } from "./pixels-video-file";

export interface PexelsVideo {
  id: string;
  duration: number;
  video_files: PexelsVideoFile[];
}
