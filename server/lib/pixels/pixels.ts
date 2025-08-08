import type { OrientationEnum, PexelsVideo } from '~~/shared';
import { logger } from '../../utils'
import { $fetch } from 'ofetch'

const durationBufferSeconds = 3;

export const initializePixels = async (config: { apiKey: string }) => {
  if (!config.apiKey) {
    throw new Error("Pixels API key is required");
  }

  const PIXELS_URL = "https://api.pexels.com"

  const fetchPixelsVideo = async (params: { q: string, orientation: OrientationEnum, excludeIds: string[], minDurationSeconds: number, timeout: number }) => {
    const { q, orientation, excludeIds, minDurationSeconds, timeout } = params;

    const { videos } = await $fetch<{ videos: PexelsVideo[] }>(`${PIXELS_URL}/videos/search`, {
      method: "GET",
      headers: {
        'Authorization': `${config.apiKey}`
      },
      params: {
        query: q,
        orientation,
        per_page: 80,
        size: 'medium'
      },
      redirect: 'follow',
      signal: AbortSignal.timeout(timeout),
    })

    if (!videos || videos.length === 0) {
      throw new Error("No videos found");
    }

    const filteredVideos = videos?.filter(video => {
      if (excludeIds.includes(video.id) || video.video_files.length === 0) return;

      const fps = video.video_files[0]?.fps ?? 30;
      const duration = fps < 25 ? video.duration * (fps / 25) : video.duration;

      if (duration >= minDurationSeconds + durationBufferSeconds) {
        for (const file of video.video_files) {
          const { id, height, link, quality, width } = file;

          if (quality === 'hd') {
            return { id, url: link, width, height }
          }
        }
      }
    }).filter(Boolean);

    if (!filteredVideos.length) {
      logger.error({ q }, 'No suitable videos found');
      throw new Error("No suitable videos found");
    }

    const video = filteredVideos[Math.floor(Math.random() * filteredVideos.length)];

    logger.debug({ q, video, minDurationSeconds, orientation }, "Selected video");

    return video;
  }

  return { fetchPixelsVideo }
}
