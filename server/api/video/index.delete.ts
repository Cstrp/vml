import { logger, queueMap } from "../../utils";
import z from "zod";

const schema = z.object({
  id: z.string().uuid(),
});

export default defineLazyEventHandler(() => {
  return defineEventHandler(async (event) => {
    const query = getQuery(event);

    const { success, error: _error, data } = await schema.safeParseAsync(query);

    if (!success) {
      throw createError({
        statusCode: 400,
        message: "Invalid account ID format",
      });
    }

    logger.info({ query }, "Received video delete request");

    const videoId = data.id;
    const target = queueMap.get(videoId);

    if (!target) {
      logger.warn({ videoId }, "Video not found in processing queue");

      throw createError({
        statusCode: 404,
        message: "Video not found",
      });
    }

    const worker = queueMap.get(videoId);
    const handler = workerMap.get(videoId);

    if (!worker) {
      logger.warn({ videoId }, "Worker not found");

      throw createError({
        statusCode: 404,
        message: "Worker not found",
      });
    }

    worker?.close();
    handler?.close();

    logger.info({ videoId }, "Video removed from processing queue");

    return { success: true, message: 'Video successfully deleted' };
  })
})
