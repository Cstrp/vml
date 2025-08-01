import type { OpenverseRequestParams } from "~~/shared/types/openverse/request-params";
import { initOpenverse } from "../../lib";
import type { H3Event } from "h3";

export default defineLazyEventHandler(async () => {
  const apiKey = process.env.OPENVERSE_API_KEY;

  if (!apiKey) {
    throw new Error("Openverse API key is required");
  }

  const openverse = await initOpenverse({ apiKey });

  return defineEventHandler(async (event: H3Event) => {
    const body = await readBody<Partial<Record<OpenverseRequestParams, string | number | boolean>>>(event);

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
      logger.info("🔍 Searching for music (query: 'cinematic ambient')...");

      const response = await openverse.fetchOpenverseAudio({
        q: body.q,
        page: body.page ?? 1,
        page_size: body.page_size ?? 1,
        mature: body.mature ?? false,
        extension: body.extension ?? "mp3",
        length: body.length ?? "short",
      });

      if (!response.results.length) {
        logger.warn("⚠️ No audio results found.");
        return {
          status: "empty",
          message: "No audio results found.",
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
      logger.info(`🔗 Download: ${track.url}`);

      return {
        status: "ok",
        track: {
          title: track.title,
          creator: track.creator,
          url: track.url,
          license: track.license,
          license_url: track.license_url,
          duration: track.duration,
        },
      };
    } catch (error) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? error.message
          : "Unknown error";
      logger.error("❌ Failed to fetch music:", error);

      return {
        status: "error",
        message: `Failed to fetch music: ${message}`,
      };
    }
  });
});
