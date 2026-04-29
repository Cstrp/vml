import { createReadStream, existsSync } from "node:fs";
import { stat } from "node:fs/promises";
import { join } from "node:path";

const TMP_DIR = join(process.cwd(), ".tmp");

const CONTENT_TYPES: Record<string, string> = {
  mp4: "video/mp4",
  wav: "audio/wav",
  vtt: "text/vtt",
  mp3: "audio/mpeg",
};

export default defineEventHandler(async (event) => {
  const filename = getRouterParam(event, "filename");

  if (
    !filename ||
    filename.includes("..") ||
    filename.includes("/") ||
    filename.includes("\\")
  ) {
    throw createError({ statusCode: 400, message: "Invalid filename" });
  }

  const filePath = join(TMP_DIR, filename);

  if (!existsSync(filePath)) {
    throw createError({ statusCode: 404, message: "File not found" });
  }

  const ext = filename.split(".").pop()?.toLowerCase() ?? "";
  const contentType = CONTENT_TYPES[ext] ?? "application/octet-stream";
  const { size } = await stat(filePath);

  setHeader(event, "Content-Type", contentType);
  setHeader(event, "Content-Length", size);
  setHeader(event, "Access-Control-Allow-Origin", "*");
  setHeader(event, "Cache-Control", "no-cache");

  return sendStream(event, createReadStream(filePath));
});
