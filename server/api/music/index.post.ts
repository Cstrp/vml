import type { OpenverseRequestParams } from "~~/shared/types/openverse/request-params";
import { initOpenverse } from "../../lib";
import { v4 as uuidv4 } from 'uuid'
import type { H3Event } from "h3";

export default defineLazyEventHandler(async () => {
  const apiKey = process.env.OPENVERSE_API_KEY;

  if (!apiKey) {
    logger.error("❌ Openverse API key is missing from environment variables");
    throw new Error("Openverse API key is required");
  }

  const openverse = await initOpenverse({ apiKey });

  return defineEventHandler(async (event: H3Event) => {
    const body = await readBody<Partial<Record<OpenverseRequestParams, string | number | boolean>>>(event);

    // Validate required fields
    if (!body.q || typeof body.q !== 'string' || body.q.trim().length === 0) {
      logger.error("❌ Missing or invalid search query");
      return {
        status: "error",
        message: "Search query is required and must be a non-empty string",
      };
    }

    try {
      logger.info("🔌 Initializing Openverse...");

      await openverse.getRateLimit();

      logger.info("✅ Openverse initialized.");
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? error.message
          : "Unknown error";
      logger.error("❌ Failed to initialize Openverse:", error);

      return {
        status: "error",
        message: `Failed to initialize Openverse: ${message}`,
      };
    }

    try {
      logger.info(`🔍 Searching for music (query: '${body.q}')...`);

      logger.debug(`🔍 Request parameters:`, {
        q: body.q,
        page: body.page ?? 1,
        page_size: body.page_size ?? 1,
        mature: body.mature ?? false,
        extension: body.extension ?? "mp3",
        length: body.length ? String(body.length) : "short",
      });

      const response = await openverse.fetchOpenverseAudio({
        q: body.q,
        page: body.page ?? 1,
        page_size: body.page_size ?? 1,
        mature: body.mature ?? false,
        extension: body.extension ?? "mp3",
        length: body.length ? String(body.length) : "short",
      });

      logger.debug(`🔍 Openverse response:`, {
        resultCount: response.results?.length || 0,
        hasResults: !!response.results?.length,
      });

      if (!response.results?.length) {
        logger.warn("⚠️ No audio results found.");
        return {
          status: "empty",
          message: "No audio results found for your search query. Try different keywords.",
        };
      }

      const track = response.results[0];

      if (!track) {
        throw createError({
          statusCode: 404,
          statusMessage: "No audio track found",
          message: "No audio track found in the response",
        });
      }

      logger.info(`🎵 Found track: "${track.title}" by ${track.creator}`);
      logger.info(`🔗 Audio URL: ${track.url}`);

      const trackData = {
        id: track.id || uuidv4(),
        audio: track.url,
        title: track.title || "Unknown Title",
        artist: track.creator || "Unknown Artist",
        artwork: track.thumbnail || track.detail_url || "",
        album: track.source || "Unknown Album",
        original: {
          source: track.source || "Unknown Source",
          license: track.license || "Unknown License",
          foreign_landing_url: track.foreign_landing_url,
        },
      };

      return {
        status: "ok",
        track: trackData,
      };
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? error.message
          : "Unknown error";
      logger.error("❌ Failed to fetch music:", {
        error: message,
        query: body.q,
        fullError: error,
      });

      return {
        status: "error",
        message: `Failed to fetch music: ${message}`,
      };
    }
  });
});
