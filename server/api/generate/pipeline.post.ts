import { writeFile, mkdir, unlink } from "node:fs/promises";
import { join } from "node:path";
import type { GenerateOptions } from "kokoro-js";

const TMP_DIR = join(process.cwd(), ".tmp");

function generateSubtitleSegments(
  text: string,
  durationMs: number,
): TranscriptionSegment[] {
  const sentences = text
    .match(/[^.!?]+[.!?]*/g)
    ?.map((s) => s.trim())
    .filter(Boolean) ?? [text.trim()];

  const totalChars = sentences.reduce((sum, s) => sum + s.length, 0);
  let cursor = 0;

  return sentences.map((sentence, i) => {
    const isLast = i === sentences.length - 1;
    const startMs = Math.round(cursor);
    const endMs = isLast
      ? durationMs
      : Math.round(cursor + (sentence.length / totalChars) * durationMs);
    cursor = endMs;
    return { text: sentence, startMs, endMs };
  });
}

function formatVttTime(ms: number): string {
  const h = Math.floor(ms / 3_600_000)
    .toString()
    .padStart(2, "0");
  const m = Math.floor((ms % 3_600_000) / 60_000)
    .toString()
    .padStart(2, "0");
  const s = Math.floor((ms % 60_000) / 1_000)
    .toString()
    .padStart(2, "0");
  const rest = (ms % 1_000).toString().padStart(3, "0");
  return `${h}:${m}:${s}.${rest}`;
}

function buildVtt(subtitles: TranscriptionSegment[]): string {
  const entries = subtitles
    .map(
      (seg, i) =>
        `${i + 1}\n${formatVttTime(seg.startMs)} --> ${formatVttTime(seg.endMs)}\n${seg.text}`,
    )
    .join("\n\n");
  return `WEBVTT\n\n${entries}`;
}

export default defineEventHandler(async (event) => {
  const {
    text,
    videoUrl,
    voice = "af_heart",
  } = await readBody<PipelineRequest>(event);

  if (!text?.trim()) {
    throw createError({ statusCode: 400, message: "text is required" });
  }
  if (!videoUrl?.trim()) {
    throw createError({ statusCode: 400, message: "videoUrl is required" });
  }

  await mkdir(TMP_DIR, { recursive: true });

  const id = Date.now();
  const audioPath = join(TMP_DIR, `audio-${id}.wav`);
  const bgPath = join(TMP_DIR, `bg-${id}.mp4`);
  const outputPath = join(TMP_DIR, `output-${id}.mp4`);
  const vttPath = join(TMP_DIR, `subs-${id}.vtt`);

  try {
    const [synthesis] = await Promise.all([
      kokoroInstance.synthesize(
        text,
        voice as NonNullable<GenerateOptions["voice"]>,
        audioPath,
      ),
      pexels.downloadVideo(videoUrl, bgPath),
    ]);

    const subtitles = generateSubtitleSegments(text, synthesis.durationMs);
    await writeFile(vttPath, buildVtt(subtitles), "utf-8");

    await ffmpegInstance.produceVideo(
      bgPath,
      audioPath,
      outputPath,
      synthesis.durationMs / 1000,
    );

    return {
      videoUrl: `/api/tmp/output-${id}.mp4`,
      vttUrl: `/api/tmp/subs-${id}.vtt`,
    } satisfies PipelineResult;
  } finally {
    await Promise.all([
      unlink(audioPath).catch(() => {}),
      unlink(bgPath).catch(() => {}),
    ]);
  }
});
