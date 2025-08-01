import { defineEventHandler, type H3Event } from "h3";

export default defineEventHandler((event: H3Event) => {
  const randId = Math.random().toString(36).slice(2, 12);
  const tracingId = event.headers["x-tracing-id"] ?? randId;

  event.headers["x-tracing-id"] = tracingId;
});
