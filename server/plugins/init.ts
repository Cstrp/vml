import { logger } from "../utils/logger";

export default defineNitroPlugin(async () => {
  const environment = import.meta.dev ? "development" : "production";
  const version = process.env.npm_package_version;

  logger.info(`[init] Starting in ${environment} mode`);

  const results = await Promise.allSettled([
    kokoroInstance.init("q8"),
    remotionInstance.init(),
    whisperInstance.init(),
    ffmpegInstance.init(),
  ]);

  const labels = ["kokoro", "remotion", "whisper", "ffmpeg"];

  for (const [i, result] of results.entries()) {
    if (result.status === "fulfilled") {
      const { success, message } = result.value;

      if (success) {
        logger.info({ message }, `[init] ${labels[i]}:`);
      } else {
        logger.warn({ message }, `[init] ${labels[i]}:`);
      }
    } else {
      logger.error({ reason: result.reason }, `[init] ${labels[i]} failed:`);
    }
  }
});
