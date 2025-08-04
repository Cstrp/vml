import { findVideo, initPixels, isPixelsInitialized } from "@@/server/lib"
import { createWriteStream, existsSync, mkdirSync } from "node:fs"
import type { ReadableStream } from "node:stream/web"
import type { VideoSearchOptions } from "@@/shared"
import { pipeline } from "node:stream"
import { promisify } from "node:util"
import { cwd } from "node:process"
import { join } from "node:path"
import z from "zod"

const schema = z.object({
  searchTerms: z.array(z.string()).min(1, "At least one search term is required"),
  minDurationSeconds: z.preprocess(Number, z.number().min(0)).default(10).optional(),
  excludeIds: z.array(z.string()).optional(),
  orientation: z.enum(["portrait", "landscape", "square"]).optional(),
  timeout: z.preprocess(Number, z.number().min(0)).default(5000).optional(),
  retryCounter: z.preprocess(Number, z.number().min(0)).default(3).optional(),
})

export default defineLazyEventHandler(() => {
  const cfg = useRuntimeConfig();
  const apiKey = cfg.public.PEXELS_API_KEY;

  if (!apiKey) {
    logger.error("❌ Pexels API key is not configured");

    throw createError({
      statusCode: 500,
      statusMessage: "Pexels API key is not configured",
      data: { error: "Pexels API key is required" }
    })
  }

  const tempDirPath = join(cwd(), "public", "videos");

  if (existsSync(tempDirPath)) {
    logger.debug(`Temp directory already exists: ${tempDirPath}`);
  } else {
    logger.debug(`Creating temp directory: ${tempDirPath}`);
    try {
      mkdirSync(tempDirPath, { recursive: true });
    } catch (err) {
      logger.error("❌ Error creating temp directory:", err);
      throw createError({
        statusCode: 500,
        statusMessage: "Failed to create temp directory",
        data: { error: "Failed to create temp directory" }
      })
    }
  }

  return defineEventHandler(async (event) => {
    const { searchTerms, ...options } = await getValidatedQuery(event, schema.parse)

    if (searchTerms.length === 0) {
      throw createError({
        statusCode: 400,
        statusMessage: "No search terms provided",
        data: { error: "At least one search term is required" }
      })
    }

    logger.info("🔍 Searching for videos with search terms:", searchTerms.join(", "))

    if (!isPixelsInitialized()) {
      await initPixels({ apiKey })
    }

    const { searchTerms: _, ...filteredOptions } = Object.fromEntries(
      Object.entries(options).filter(([_, value]) => value !== undefined)
    ) as unknown as VideoSearchOptions


    const video = await findVideo({ searchTerms, ...filteredOptions })
    const streamPipeline = promisify(pipeline);

    const filePath = join(tempDirPath, `${video.id}.mp4`);
    const stream = createWriteStream(filePath);

    try {
      const response = await fetch(video.url);

      if (!response.ok || !response.body) {
        throw new Error(`Invalid response from video URL: ${response.status}`);
      }

      logger.info(response)

      await streamPipeline(response.body as ReadableStream, stream);

      logger.info(`✅ Video stream processed successfully: ${filePath}`);

      return { success: true, video: { ...video, path: `/videos/${video.id}.mp4` } };
    } catch (error) {
      logger.error("❌ Error processing video stream:", error);

      throw createError({
        statusCode: 500,
        statusMessage: "Failed to process video stream",
        data: { error: "Failed to process video stream" }
      })
    }
  });
})
