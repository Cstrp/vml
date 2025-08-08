import type { PexelsVideoFile } from "./pixels-video-file";

export interface PexelsVideo {
  id: string;
  duration: number;
  url: string;
  video_files: PexelsVideoFile[];
}
