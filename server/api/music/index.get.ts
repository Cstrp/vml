import { initOpenverse } from "../../lib";
import type { H3Event } from "h3";

export default defineLazyEventHandler(async () => {
  const apiKey = process.env.OPENVERSE_API_KEY;

  if (!apiKey) {
    throw new Error("Openverse API key is required");
  }

  const openverse = await initOpenverse({ apiKey });

  return defineEventHandler(async (_event: H3Event): Promise<{
    status: string;
    rateLimit?: {
      requestsThisMinute: number;
      requestsToday: number;
      verified: boolean;
    };
    message?: string;
  }> => {
    try {
      const limitInfo = await openverse.getRateLimit();

      return {
        status: "ok",
        rateLimit: {
          requestsThisMinute: limitInfo.requests_this_minute ?? 0,
          requestsToday: limitInfo.requests_today ?? 0,
          verified: limitInfo.verified,
        },
      };
    } catch (error: unknown) {
      const message =
        typeof error === "object" && error !== null && "message" in error
          ? error.message
          : "Unknown error";

      logger.error("❌ Openverse initialization error:", error);

      return {
        status: "error",
        message: `Failed to initialize Openverse: ${message}`,
      };
    }
  });
});
