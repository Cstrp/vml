import { writeFile, unlink, mkdir } from "node:fs/promises";
import { join } from "node:path";

const TMP_DIR = join(process.cwd(), ".tmp");

export default defineEventHandler(async (event) => {
  const parts = await readMultipartFormData(event);
  const audioPart = parts?.find((p) => p.name === "audio");

  if (!audioPart?.data) {
    throw createError({ statusCode: 400, message: "audio file is required" });
  }

  await mkdir(TMP_DIR, { recursive: true });
  const tmpPath = join(TMP_DIR, `audio-${Date.now()}.wav`);

  try {
    await writeFile(tmpPath, audioPart.data);
    return await whisperInstance.transcribe(tmpPath);
  } finally {
    await unlink(tmpPath).catch(() => {});
  }
});
