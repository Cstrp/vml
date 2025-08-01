import type { NitroAppPlugin } from "nitropack";
import { pinoHttp } from "pino-http";
import { v4 as uuidv4 } from "uuid";
import { pino } from "pino";

export default <NitroAppPlugin>async function (nitroApp) {
  const level =
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === "production" ? "info" : "debug");

  const logger = pino({
    name: "mtap",
    level,
    transport: {
      target: "pino-pretty",
      options: {
        colorize: true,
        singleLine: true,
        translateTime: "yyyy-mm-dd HH:MM:ss",
        ignore: "pid,hostname",
        messageFormat: "[{msg}]",
        levelFirst: true,
      },
    },
    serializers: {
      err: pino.stdSerializers.err,
      req: (req) => ({
        method: req.method,
        url: req.url,
        userAgent: req.headers["user-agent"]?.substring(0, 50) + "...",
        ip: req.headers["x-forwarded-for"] || req.connection?.remoteAddress,
      }),
      res: (res) => ({
        statusCode: res.statusCode,
        contentType: res.getHeader?.("content-type"),
      }),
    },
  });

  const httpLogger = pinoHttp({
    logger,
    genReqId: (req) => req.id || uuidv4(),
    customSuccessMessage: (req, res) => {
      return `${req.method} ${req.url} completed with status ${res.statusCode}`;
    },
    customErrorMessage: (req, res, err) => {
      return `${req.method} ${req.url} failed with status ${res.statusCode}: ${err.message}`;
    },
    customAttributeKeys: {
      req: "request",
      res: "response",
      err: "error",
    },
  });

  if (import.meta.server) {
    nitroApp.hooks.hook("request", async (event) => {
      const reqId = uuidv4();
      event.node.req.id = reqId;
      event.node.res.setHeader("X-Request-Id", reqId);

      httpLogger(event.node.req, event.node.res);

      event.context.logger = logger.child({
        reqId,
        appVersion: process.env.npm_package_version || "unknown",
      });
    });
  }
};
