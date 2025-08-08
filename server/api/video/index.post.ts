import { logger } from "../../utils";
import { vml } from "../../lib";

export default defineLazyEventHandler(() => {
  const cfg = useRuntimeConfig();
  const pixelsApiKey = cfg.public.PEXELS_API_KEY || "your-pixels-api-key";
  const openverseApiKey = cfg.public.OPENVERSE_API_KEY || "your-openverse-api-key";

  if (!pixelsApiKey || !openverseApiKey) {
    logger.error("Missing API keys");
    throw createError({ statusCode: 400, statusMessage: "Missing required API keys" });
  }

  const { createVideo } = vml(pixelsApiKey, openverseApiKey);

  return defineEventHandler(async (event) => {
    const body = await readBody(event);

    logger.info({ body }, "Received video creation request");

    const video = createVideo('', {}, {});

    logger.info({ video }, "Video creation initiated");
  })
})
