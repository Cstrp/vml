import { defineEventHandler, type H3Event, getHeader } from "h3";
import { logger } from "../utils";

export default defineEventHandler((event: H3Event) => {
  const startTime = Date.now();

  event.context.performance = {
    startTime,
    endTime: 0,
    duration: 0,
    memoryUsage: process.memoryUsage(),
  };

  event.context.request = {
    ip:
      getHeader(event, "x-forwarded-for") ||
      event.node.req.socket.remoteAddress ||
      "",
    userAgent: getHeader(event, "user-agent"),
    origin: getHeader(event, "origin"),
    referer: getHeader(event, "referer"),
    acceptLanguage: getHeader(event, "accept-language"),
    method: event.node.req.method,
    url: event.node.req.url,
    timestamp: new Date().toISOString(),
  };

  const res = event.node.res;

  const onFinish = () => {
    const endTime = Date.now();
    const duration = endTime - startTime;
    event.context.performance.endTime = endTime;
    event.context.performance.duration = duration;

    try {

      if (!res.headersSent) {
        res.setHeader("X-Response-Time", `${duration}ms`);
      }

    } catch {
      logger.error("Failed to set X-Response-Time header", {
        duration,
        url: event.node.req.url,
        method: event.node.req.method,
      });
    }

    if (duration > 1000 && event.context.logger) {
      event.context.logger.warn(
        {
          duration,
          url: event.node.req.url,
          method: event.node.req.method,
        },
        `⚠️ Slow request: ${duration}ms`
      );
    }

    res.removeListener("finish", onFinish);
    res.removeListener("close", onFinish);
  };

  res.on("finish", onFinish);
  res.on("close", onFinish);
});
