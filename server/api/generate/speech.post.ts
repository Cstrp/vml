import { readFile, unlink, mkdir } from "node:fs/promises";
import { join } from "node:path";
import type { GenerateOptions } from "kokoro-js";

const TMP_DIR = join(process.cwd(), ".tmp");

export default defineEventHandler(async (event) => {
  const { text, voice } = await readBody<SpeechRequest>(event);

  if (!text?.trim()) {
    throw createError({ statusCode: 400, message: "text is required" });
  }

  await mkdir(TMP_DIR, { recursive: true });
  const outputPath = join(TMP_DIR, `speech-${Date.now()}.wav`);

  try {
    const result = await kokoroInstance.synthesize(
      text,
      (voice ?? "af_heart") as NonNullable<GenerateOptions["voice"]>,
      outputPath,
    );
    const buffer = await readFile(result.outputPath);
    return send(event, buffer, "audio/wav");
  } finally {
    await unlink(outputPath).catch(() => {});
  }
});
