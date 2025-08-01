import type { OrientationEnum, OrientationConfig } from "../../shared/types/remotion";
import { logger } from "../utils/logger";
import type {
  PixelsConfig,
  Video,
  VideoSearchOptions,
  PexelsAPIResponse,
  PexelsVideo,
  PixelsError
} from "../../shared/types/pixels";

// Default configuration constants
const DEFAULT_JOKER_TERMS: string[] = ["nature", "globe", "space", "ocean"];
const DEFAULT_DURATION_BUFFER_SECONDS = 3;
const DEFAULT_TIMEOUT_MS = 5000;
const DEFAULT_RETRY_TIMES = 3;

interface PixelsState {
  config: PixelsConfig;
  isInitialized: boolean;
}

let pixelsState: PixelsState | null = null;

/**
 * Get orientation configuration based on orientation type
 */
export const getOrientationConfig = (orientation: OrientationEnum): OrientationConfig => {
  switch (orientation) {
    case "portrait":
      return {
        component: "PortraitVideo",
        width: 1080,
        height: 1920
      };
    case "landscape":
      return {
        component: "LandscapeVideo",
        width: 1920,
        height: 1080
      };
    case "square":
      return {
        component: "SquareVideo",
        width: 1080,
        height: 1080
      };
    default:
      throw new Error(`Unsupported orientation: ${orientation}`);
  }
};

/**
 * Initialize Pixels API with configuration
 */
export const initPixels = (apiKey: string, config?: Partial<PixelsConfig>): void => {
  if (!apiKey) {
    throw new Error("API key is required for Pixels initialization");
  }

  const defaultConfig: PixelsConfig = {
    apiKey,
    defaultTimeout: DEFAULT_TIMEOUT_MS,
    retryTimes: DEFAULT_RETRY_TIMES,
    durationBufferSeconds: DEFAULT_DURATION_BUFFER_SECONDS,
    jokerTerms: DEFAULT_JOKER_TERMS,
  };

  pixelsState = {
    config: {
      ...defaultConfig,
      ...config,
      apiKey, // Ensure apiKey is always set
    },
    isInitialized: true,
  };

  logger.debug("Pixels API initialized successfully");
};

/**
 * Get the current Pixels configuration
 */
export const getPixelsConfig = (): PixelsConfig => {
  if (!pixelsState?.isInitialized) {
    throw new Error("Pixels not initialized. Call initPixels() first.");
  }
  return pixelsState.config;
};

/**
 * Check if Pixels is initialized
 */
export const isPixelsInitialized = (): boolean => {
  return pixelsState?.isInitialized ?? false;
};

/**
 * Shuffle an array randomly
 */
const shuffleArray = <T>(array: T[]): T[] => {
  return [...array].sort(() => Math.random() - 0.5);
};

/**
 * Internal function to find a video from Pexels API
 */
const findVideoInternal = async (
  searchTerm: string,
  minDurationSeconds: number,
  excludeIds: string[],
  orientation: OrientationEnum,
  timeout: number,
): Promise<Video> => {
  if (!pixelsState?.isInitialized) {
    throw new Error("Pixels not initialized. Call initPixels() first.");
  }

  const config = pixelsState.config;

  if (!config.apiKey) {
    throw new Error("API key not set");
  }

  logger.debug(
    { searchTerm, minDurationSeconds, orientation },
    "Searching for video in Pexels API",
  );

  const headers = new Headers();
  headers.append("Authorization", config.apiKey);

  try {
    const response = await fetch(
      `https://api.pexels.com/videos/search?orientation=${orientation}&size=medium&per_page=80&query=${encodeURIComponent(searchTerm)}`,
      {
        method: "GET",
        headers,
        redirect: "follow",
        signal: AbortSignal.timeout(timeout),
      },
    );

    if (!response.ok) {
      if (response.status === 401) {
        throw new Error(
          "Invalid Pexels API key - please make sure you get a valid key from https://www.pexels.com/api and set it in the environment variable PEXELS_API_KEY",
        );
      }
      const error: PixelsError = new Error(`Pexels API error: ${response.status} ${response.statusText}`);
      error.status = response.status;
      error.statusText = response.statusText;
      throw error;
    }

    const data: PexelsAPIResponse = await response.json();
    const videos = data.videos;

    const { width: requiredVideoWidth, height: requiredVideoHeight } =
      getOrientationConfig(orientation);

    if (!videos || videos.length === 0) {
      logger.error(
        { searchTerm, orientation },
        "No videos found in Pexels API",
      );
      throw new Error("No videos found");
    }

    // Find all videos that fit the criteria, then select one randomly
    const filteredVideos = videos
      .map((video: PexelsVideo) => {
        if (excludeIds.includes(video.id)) {
          return null;
        }
        if (!video.video_files.length) {
          return null;
        }

        // Calculate the real duration of the video by converting the FPS to 25
        const fps = video.video_files[0].fps;
        const duration =
          fps < 25 ? video.duration * (fps / 25) : video.duration;

        if (duration >= minDurationSeconds + config.durationBufferSeconds) {
          for (const file of video.video_files) {
            if (
              file.quality === "hd" &&
              file.width === requiredVideoWidth &&
              file.height === requiredVideoHeight
            ) {
              return {
                id: video.id,
                url: file.link,
                width: file.width,
                height: file.height,
              };
            }
          }
        }
        return null;
      })
      .filter((video): video is Video => video !== null);

    if (!filteredVideos.length) {
      logger.error({ searchTerm }, "No videos found in Pexels API");
      throw new Error("No videos found");
    }

    const video = filteredVideos[
      Math.floor(Math.random() * filteredVideos.length)
    ];

    logger.debug(
      { searchTerm, video, minDurationSeconds, orientation },
      "Found video from Pexels API",
    );

    return video;
  } catch (error: unknown) {
    logger.error(error, "Error fetching videos from Pexels API");
    throw error;
  }
};

/**
 * Find a video from Pexels API with search terms and fallback options
 */
export const findVideo = async (options: VideoSearchOptions): Promise<Video> => {
  if (!pixelsState?.isInitialized) {
    throw new Error("Pixels not initialized. Call initPixels() first.");
  }

  const config = pixelsState.config;
  const {
    searchTerms,
    minDurationSeconds,
    excludeIds = [],
    orientation = "portrait" as OrientationEnum,
    timeout = config.defaultTimeout,
    retryCounter = 0,
  } = options;

  // Shuffle the search terms to randomize the search order
  const shuffledJokerTerms = shuffleArray(config.jokerTerms);
  const shuffledSearchTerms = shuffleArray(searchTerms);

  for (const searchTerm of [...shuffledSearchTerms, ...shuffledJokerTerms]) {
    try {
      return await findVideoInternal(
        searchTerm,
        minDurationSeconds,
        excludeIds,
        orientation,
        timeout,
      );
    } catch (error: unknown) {
      if (
        error instanceof Error &&
        error instanceof DOMException &&
        error.name === "TimeoutError"
      ) {
        if (retryCounter < config.retryTimes) {
          logger.warn(
            { searchTerm, retryCounter },
            "Timeout error, retrying...",
          );
          return await findVideo({
            ...options,
            retryCounter: retryCounter + 1,
          });
        }
        logger.error(
          { searchTerm, retryCounter },
          "Timeout error, retry limit reached",
        );
        throw error;
      }

      logger.error(error, "Error finding video in Pexels API for term");
    }
  }

  logger.error(
    { searchTerms },
    "No videos found in Pexels API for the given terms",
  );
  throw new Error("No videos found in Pexels API");
};

/**
 * Find a video with simplified parameters (backward compatibility)
 */
export const findVideoSimple = async (
  searchTerms: string[],
  minDurationSeconds: number,
  excludeIds: string[] = [],
  orientation: OrientationEnum = "portrait" as OrientationEnum,
  timeout?: number,
  retryCounter?: number,
): Promise<Video> => {
  return findVideo({
    searchTerms,
    minDurationSeconds,
    excludeIds,
    orientation,
    timeout,
    retryCounter,
  });
};

/**
 * Get available video qualities for a search term
 */
export const getAvailableQualities = async (
  searchTerm: string,
  orientation: OrientationEnum = "portrait" as OrientationEnum,
): Promise<string[]> => {
  if (!pixelsState?.isInitialized) {
    throw new Error("Pixels not initialized. Call initPixels() first.");
  }

  const config = pixelsState.config;
  const headers = new Headers();
  headers.append("Authorization", config.apiKey);

  try {
    const response = await fetch(
      `https://api.pexels.com/videos/search?orientation=${orientation}&size=medium&per_page=10&query=${encodeURIComponent(searchTerm)}`,
      {
        method: "GET",
        headers,
        redirect: "follow",
        signal: AbortSignal.timeout(config.defaultTimeout),
      },
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status} ${response.statusText}`);
    }

    const data: PexelsAPIResponse = await response.json();
    const qualities = new Set<string>();

    data.videos.forEach((video: PexelsVideo) => {
      video.video_files.forEach((file) => {
        qualities.add(file.quality);
      });
    });

    return Array.from(qualities);
  } catch (error: unknown) {
    logger.error(error, "Error fetching available qualities from Pexels API");
    throw error;
  }
};

/**
 * Reset Pixels state (useful for testing or reconfiguration)
 */
export const resetPixels = (): void => {
  pixelsState = null;
  logger.debug("Pixels state reset");
};

/**
 * Update API key
 */
export const updateApiKey = (apiKey: string): void => {
  if (!pixelsState?.isInitialized) {
    throw new Error("Pixels not initialized. Call initPixels() first.");
  }

  pixelsState.config.apiKey = apiKey;
  logger.debug("Pixels API key updated");
};

/**
 * Get current API key (masked for security)
 */
export const getCurrentApiKey = (): string => {
  if (!pixelsState?.isInitialized) {
    throw new Error("Pixels not initialized. Call initPixels() first.");
  }

  const key = pixelsState.config.apiKey;
  return key.substring(0, 8) + "...";
};
