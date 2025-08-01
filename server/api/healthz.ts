import { defineLazyEventHandler, defineEventHandler } from "h3";
import { sleep, type WhisperConfig } from "~~/shared";
import { initFFmpeg } from "../lib/ffmpeg";
import { initPixels } from "../lib/pixels";
import { initWhisper } from "../lib/whisper";
import {
  isFFmpegInitialized,
  isPixelsInitialized,
  isWhisperInitialized,
} from "../lib";

export default defineLazyEventHandler(() => {
  const cfg = useRuntimeConfig();

  const WHISPER_CONFIG: WhisperConfig = {
    runningInDocker: cfg.public.whisper.RUNNING_IN_DOCKER,
    whisperInstallPath: cfg.public.whisper.WHISPER_INSTALL_PATH,
    whisperVersion: cfg.public.whisper.WHISPER_VERSION,
    whisperModel: cfg.public.whisper.WHISPER_MODEL as WhisperModel,
    whisperVerbose: cfg.public.whisper.WHISPER_VERBOSE
  };

  const PEXELS_API_KEY = cfg.public.PEXELS_API_KEY;

  const withInit = async (
    name: string,
    condition: () => boolean,
    init: () => Promise<void>,
    delay = 200,
    write?: (msg: string) => void
  ): Promise<boolean> => {
    if (condition()) {
      write?.(`✅ ${name} already initialized.`);
      return true;
    }

    write?.(`⚙️ Initializing ${name}...`);
    try {
      await init();
      await sleep(delay);
      write?.(`✅ ${name} initialized.`);
      return true;
    } catch (err) {
      write?.(`❌ Failed to initialize ${name}.`);
      console.error(`${name} error:`, err);
      return false;
    }
  }


  return defineEventHandler(async (event) => {
    const res = event.node.res;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Transfer-Encoding", "chunked");

    const logs: string[] = [];

    const write = (msg: string) => {
      logs.push(msg);
      res.write(`${JSON.stringify({ step: msg })}\n`);
    };

    const ffmpeg = await withInit("FFmpeg", isFFmpegInitialized, initFFmpeg, 200, write);
    const pixels = await withInit("Pixels", isPixelsInitialized, async () => initPixels(PEXELS_API_KEY), 300, write);
    const whisper = await withInit("Whisper", isWhisperInitialized, async () => initWhisper(WHISPER_CONFIG), 400, write);

    const services = { ffmpeg, pixels, whisper };
    const allHealthy = Object.values(services).every(Boolean);

    const response = {
      status: allHealthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      message: allHealthy
        ? "All services healthy"
        : "One or more services failed",
      services,
      logs,
    };

    res.write(`${JSON.stringify(response)}\n`);
    res.end();
  })
});
