import type { PexelsVideo } from "./pixels-video";

export interface PexelsAPIResponse {
  videos: PexelsVideo[];
  page: number;
  per_page: number;
  total_results: number;
  prev_page?: string;
  next_page?: string;
}
