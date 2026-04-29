import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";

const API_URL = "https://api.pexels.com/videos/search";
const DEFAULT_TIMEOUT = 5000;
const RETRIES = 3;
const DURATION_BUFFER = 3;

const JOKER_TERMS = ["nature", "globe", "space", "ocean"] as const;

class Pexels {
  private static instance: Pexels;

  private constructor(private readonly apiKey: string) {
    if (!apiKey) {
      throw new Error("PEXELS_API_KEY is required");
    }
  }

  public static getInstance(apiKey: string): Pexels {
    if (!Pexels.instance) {
      Pexels.instance = new Pexels(apiKey);
    }
    return Pexels.instance;
  }

  public async searchVideos(
    query: string,
    options: PexelsSearchOptions = {},
  ): Promise<PexelsVideo[]> {
    const { minDuration, perPage = 15, page = 1, orientation, size } = options;

    const params = new URLSearchParams({
      query,
      per_page: String(perPage),
      page: String(page),
      ...(orientation ? { orientation } : {}),
      ...(size ? { size } : {}),
    });

    let lastError: unknown;

    for (let attempt = 0; attempt < RETRIES; attempt++) {
      try {
        const res = await fetch(`${API_URL}?${params}`, {
          headers: { Authorization: this.apiKey },
          signal: this.withTimeout(DEFAULT_TIMEOUT),
        });

        if (!res.ok) throw new Error(`Pexels API error: ${res.status}`);

        const data = (await res.json()) as { videos: PexelsVideo[] };

        let videos = data.videos;

        if (minDuration !== undefined) {
          videos = videos.filter((v) => {
            const fps = v.video_files[0]?.fps ?? 25;
            return (
              this.normalizeDuration(v.duration, fps) >=
              minDuration - DURATION_BUFFER
            );
          });
        }
        return this.shuffle(videos);
      } catch (err) {
        lastError = err;
        if (attempt < RETRIES - 1) await sleep(500 * (attempt + 1));
      }
    }

    const fallbackQuery = this.shuffle(JOKER_TERMS)[0]!;

    if (query !== fallbackQuery) {
      return this.searchVideos(fallbackQuery, options);
    }

    throw lastError;
  }

  public async downloadVideo(url: string, outputPath: string): Promise<string> {
    const res = await fetch(url, { signal: this.withTimeout(60_000) });

    if (!res.ok || !res.body) {
      throw new Error(`Failed to download video: ${res.status}`);
    }

    const dest = createWriteStream(outputPath);

    await pipeline(res.body as unknown as NodeJS.ReadableStream, dest);

    return outputPath;
  }

  private shuffle = <T>(arr: readonly T[]): T[] =>
    [...arr].sort(() => Math.random() - 0.5);

  private withTimeout = (ms: number) => AbortSignal.timeout(ms);

  private normalizeDuration = (duration: number, fps: number) =>
    fps < 25 ? duration * (fps / 25) : duration;
}

export const pexels = Pexels.getInstance(process.env.PEXELS_API_KEY ?? "");
