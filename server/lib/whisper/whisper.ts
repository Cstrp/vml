import type { AutomaticSpeechRecognitionPipeline } from "@xenova/transformers";
import type { Caption, WhisperModel } from "@@/shared";
import { pipeline } from "@xenova/transformers";
import wf from "wavefile";
import { readFileSync } from "fs";
import { logger } from "../../utils";
import { cwd } from "process";
import { join } from "path";

type ASRChunk = { text: string; timestamp: [number, number] };
type ASRReturn = ASRChunk[] | { chunks: ASRChunk[] };

/**
 * Initializes the Whisper ASR model.
 * @param config - The configuration for the ASR model.
 * @returns The initialized ASR model.
 */
export const initializeWhisper = async (
  config: { model: WhisperModel; options?: { quantized: boolean; cache_dir: string } },
): Promise<AutomaticSpeechRecognitionPipeline> => {
  try {
    const model = await pipeline(
      "automatic-speech-recognition",
      config.model,
      {
        cache_dir: config.options?.cache_dir ?? 'node_modules/.cache/@xenova/transformers',
        revision: config.model.includes("/whisper-medium") ? "no_attentions" : "main",
        quantized: config.options?.quantized ?? false,
      }
    );

    return model;
  } catch (error) {
    logger.error({ error }, "Error initializing Whisper model:");
    throw error;
  }
};

/**
 * @param audioPath - The path to the audio file to transcribe
 * @param config - The configuration for the transcription model
 * @returns The transcription result as an array of Caption objects
 * @example
 * const audioFilePath = join(cwd(), "audio.wav");
 * const result = await transcribe(audioFilePath, "Xenova/whisper-tiny");
 * console.log(JSON.stringify(result, null, 2)); // Output [ { text: <transcribed_text>, start: <start_time>, end: <end_time> } ]
 */
export const transcribe = async (audioPath: string, config: { model: WhisperModel }): Promise<Caption[]> => {
  logger.debug({ audioPath, config }, "Transcribing audio file");

  const asr = (await initializeWhisper(config));

  const buffer = readFileSync(audioPath);
  const wav = new wf.WaveFile(buffer);

  wav.toSampleRate(16000);
  wav.toBitDepth("32f");

  let audio: Float64Array = wav.getSamples() as Float64Array;

  if (Array.isArray(audio)) {
    if (audio.length > 1) {
      const left: Float64Array = audio[0];
      const right: Float64Array = audio[1];
      audio = left.map((s, i) => (s + right[i]!) * 0.5);
    } else {
      audio = audio[0];
    }
  }

  logger.debug({ audioPath, audio }, "Audio file processed");

  const result = await asr(audio, {
    force_full_sequences: false,
    return_timestamps: true,
    chunk_length_s: 30,
    stride_length_s: 5,
    do_sample: false,
    top_k: 0,
  });

  logger.debug({ audioPath }, "Transcription finished, creating captions");

  if (!result) return [];

  const asrResult = result as ASRReturn;
  const chunks = Array.isArray(asrResult)
    ? asrResult
    : asrResult.chunks;

  if (!chunks || !Array.isArray(chunks)) {
    return [];
  }

  logger.debug({ audioPath, captions: chunks }, "Transcription result");

  return chunks.map((chunk: ASRChunk) => ({
    text: chunk.text,
    start: Array.isArray(chunk.timestamp) ? chunk.timestamp[0] : 0,
    end: Array.isArray(chunk.timestamp) ? chunk.timestamp[1] : 0,
  }));
};

const main = async () => {
  const file = join(cwd(), "audio.wav");
  const result = await transcribe(file, { model: 'Xenova/whisper-tiny' });
  logger.info({ result });
}

main().catch((error) => {
  logger.error("Error occurred during transcription:", error);
});
