import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  downloadWhisperModel,
  installWhisperCpp,
  transcribe,
} from "@remotion/install-whisper-cpp";

const WHISPER_DIR = join(process.cwd(), "whisper-cpp");
const MODEL_DIR = join(WHISPER_DIR, "models");
const BINARY_PATH = join(WHISPER_DIR, "main");
const MODEL_PATH = join(MODEL_DIR, "ggml-tiny.bin");
const WHISPER_VERSION = "1.7.1";

class Whisper {
  private static instance: Whisper;
  private initialized = false;

  public static getInstance(): Whisper {
    if (!Whisper.instance) {
      Whisper.instance = new Whisper();
    }
    return Whisper.instance;
  }

  public async init(): Promise<DEFAULT_RESPONSE> {
    if (this.initialized) {
      return { success: true, message: "Whisper already initialized" };
    }
    try {
      if (!existsSync(BINARY_PATH)) {
        await installWhisperCpp({
          to: WHISPER_DIR,
          version: WHISPER_VERSION,
          printOutput: import.meta.dev,
        });
        console.info("Whisper installed successfully");
      }

      if (!existsSync(MODEL_PATH)) {
        await downloadWhisperModel({
          model: "tiny",
          folder: MODEL_DIR,
          printOutput: import.meta.dev,
          onProgress: (bytes, total) => {
            const percent = ((bytes / total) * 100).toFixed(2);
            console.info(
              `Downloading Whisper model: ${percent}% (${bytes}/${total} bytes)`,
            );
          },
        });
        console.info("Whisper model downloaded successfully");
      }

      this.initialized = true;
      return { success: true, message: "Whisper initialized successfully" };
    } catch (error) {
      console.error("Failed to initialize Whisper:", error);
      return { success: false, message: "Failed to initialize Whisper" };
    }
  }

  public async transcribe(audioPath: string): Promise<TranscriptionResult> {
    if (!this.initialized) {
      throw new Error("Whisper is not initialized");
    }
    const result = await transcribe({
      inputPath: audioPath,
      whisperPath: WHISPER_DIR,
      whisperCppVersion: WHISPER_VERSION,
      model: "tiny",
      tokenLevelTimestamps: false,
    });
    const text = result.transcription
      .map((s) => s.text)
      .join(" ")
      .trim();
    const segments = result.transcription.map((s) => ({
      text: s.text.trim(),
      startMs: s.offsets.from,
      endMs: s.offsets.to,
    }));
    return { text, segments };
  }
}

const whisperInstance = Whisper.getInstance();

export { whisperInstance };
