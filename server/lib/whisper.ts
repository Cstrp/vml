import type { Caption, WhisperConfig, WhisperState } from '../../shared'
import { exec } from "child_process";
import { logger } from "../utils";
import { promisify } from "util";
import { existsSync } from "fs";
import path from "path";

const execAsync = promisify(exec);

export const ErrorWhisper = new Error("There was an error with WhisperCpp");

let whisperState: WhisperState | null = null;


export const initWhisper = async (config: WhisperConfig): Promise<void> => {
  const whisperBinaryPath = path.join(config.whisperInstallPath, "main");
  const modelsPath = path.join(config.whisperInstallPath, "models");
  const modelPath = path.join(modelsPath, `ggml-${config.whisperModel}.bin`);

  if (!existsSync(whisperBinaryPath)) {
    throw new Error(`Whisper binary not found at ${whisperBinaryPath}. Run 'pnpm setup:models' first.`);
  }

  if (!existsSync(modelPath)) {
    throw new Error(`Whisper model not found at ${modelPath}. Run 'pnpm setup:models' first.`);
  }

  logger.debug("Whisper binary and model found, initializing");

  whisperState = {
    config,
    isInitialized: true,
  };

  logger.debug("Whisper initialized successfully");
};

export const getWhisperConfig = (): WhisperConfig => {
  if (!whisperState?.isInitialized) {
    throw new Error("Whisper not initialized. Call initWhisper() first.");
  }
  return whisperState.config;
};

export const isWhisperInitialized = (): boolean => {
  return whisperState?.isInitialized ?? false;
};

export const createCaptions = async (audioPath: string): Promise<Caption[]> => {
  if (!whisperState?.isInitialized) {
    throw new Error("Whisper not initialized. Call initWhisper() first.");
  }

  const config = whisperState.config;
  const whisperBinaryPath = path.join(config.whisperInstallPath, "main");
  const modelsPath = path.join(config.whisperInstallPath, "models");
  const modelPath = path.join(modelsPath, `ggml-${config.whisperModel}.bin`);

  logger.debug({ audioPath }, "Starting to transcribe audio");

  const command = [
    whisperBinaryPath,
    "-m", modelPath,
    "-f", audioPath,
    "--output-json",
    "--word-timestamps"
  ].join(" ");

  try {
    const { stdout } = await execAsync(command);

    const transcriptionData = JSON.parse(stdout);

    logger.debug({ audioPath }, "Transcription finished, creating captions");

    const captions: Caption[] = [];

    if (transcriptionData.transcription && Array.isArray(transcriptionData.transcription)) {
      for (const segment of transcriptionData.transcription) {
        if (!segment.text || segment.text.trim() === "") {
          continue;
        }

        const startMs = Math.round((segment.start || 0) * 1000);
        const endMs = Math.round((segment.end || segment.start || 0) * 1000);

        captions.push({
          text: segment.text.trim(),
          startMs,
          endMs,
        });
      }
    }

    logger.debug({ audioPath, captionsCount: captions.length }, "Captions created");
    return captions;

  } catch (error) {
    logger.error({ audioPath, error }, "Failed to transcribe audio");
    throw new Error(`Whisper transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export const resetWhisper = (): void => {
  whisperState = null;
};
