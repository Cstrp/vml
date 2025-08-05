import { generateAudio } from "~~/server/lib";
import { VoiceEnum } from "../../../shared";
import crypto from 'node:crypto'
import fs from 'fs/promises';
import path from 'node:path'
import z from "zod";

const schema = z.object({
  text: z.string().min(1).max(1000),
  voice: z.nativeEnum(VoiceEnum),
  cfg: z.object({
    model: z.string().optional(),
    dtype: z.enum(["fp32", "fp16", "q8", "q4", "q4f16"]).default("fp16").optional(),
    device: z.enum(["cpu", "wasm", "webgpu"]).default("cpu"),
  }).optional(),
});

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const result = schema.safeParse(body);

  if (!result.success) {
    throw createError({ statusCode: 400, statusMessage: "Invalid request", data: result.error });
  }

  const { text, voice, cfg } = result.data;

  const kokoroCfg = cfg
    ? {
      ...cfg,
      ...(cfg.model !== undefined ? { model: cfg.model } : {}),
    }
    : undefined;

  try {
    const audioResponse = await generateAudio(text, voice, {
      model: kokoroCfg?.model,
      dtype: kokoroCfg?.dtype,
      device: kokoroCfg?.device === "cpu" ? "cpu" : undefined,
    });


    const publicDir = path.resolve(process.cwd(), 'public', 'tts');

    await fs.mkdir(publicDir, { recursive: true });

    const fileName = `tts_${crypto.randomUUID()}.wav`;
    const filePath = path.join(publicDir, fileName);

    await fs.writeFile(filePath, Buffer.from(audioResponse.audio));

    return {
      success: true,
      url: `/tts/${fileName}`,
    };
  } catch (error) {
    console.error("Kokoro TTS Error:", error);

    if (error instanceof Error && error.message.includes("Protobuf parsing failed")) {
      throw createError({
        statusCode: 500,
        statusMessage: "TTS model corrupted. Please restart the server to re-download the model.",
        data: { error: "Model file corrupted" },
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: "Text-to-speech generation failed",
      data: { error: error instanceof Error ? error.message : "Unknown error" },
    });
  }
});
