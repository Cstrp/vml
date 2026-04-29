import { existsSync, mkdirSync } from "node:fs";
import { cwd } from "node:process";
import { join } from "node:path";
import pino from "pino";

const logsDirectory = join(cwd(), ".tmp", "logs");

if (!existsSync(logsDirectory)) {
  mkdirSync(logsDirectory, { recursive: true });
}

export const logger = pino({
  level:
    process.env.LOG_LEVEL ||
    (process.env.NODE_ENV === "production" ? "info" : "debug"),
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: {
    targets: [
      {
        level: "trace",
        target: "pino/file",
        options: {
          destination: join(logsDirectory, "trace.log"),
        },
      },
      {
        level: "debug",
        target: "pino/file",
        options: {
          destination: join(logsDirectory, "debug.log"),
        },
      },
      {
        level: "info",
        target: "pino/file",
        options: {
          destination: join(logsDirectory, "info.log"),
        },
      },
      {
        level: "warn",
        target: "pino/file",
        options: {
          destination: join(logsDirectory, "warn.log"),
        },
      },
      {
        level: "error",
        target: "pino/file",
        options: {
          destination: join(logsDirectory, "error.log"),
        },
      },
      {
        level: "info",
        target: "pino-pretty",
        options: {
          colorize: true,
          singleLine: true,
          translateTime: "SYS:standard",
          ignore: "pid,hostname",
        },
      },
    ],
  },
  base: { pid: process.pid },
});
