import type { AudioResult, KokoroConfig, KokoroModelPrecision, KokoroState, Voices } from "../../shared";
import { KokoroTTS, TextSplitterStream } from "kokoro-js";
import { VoiceEnum } from "../../shared";
import { logger } from "../utils";

let kokoroState: KokoroState | null = null;


export const initKokoro = async (dtype: KokoroModelPrecision, model: string = "onnx-community/Kokoro-82M-v1.0-ONNX"): Promise<void> => {
  logger.debug("Initializing Kokoro TTS");

  const tts = await KokoroTTS.from_pretrained(model, {
    dtype,
    device: "cpu", // Only "cpu" is supported in node
  });

  kokoroState = {
    tts,
    config: {
      model,
      dtype,
      device: "cpu"
    },
    isInitialized: true,
  };

  logger.debug("Kokoro TTS initialized successfully");
};


export const getKokoroConfig = (): KokoroConfig => {
  if (!kokoroState?.isInitialized) {
    throw new Error("Kokoro not initialized. Call initKokoro() first.");
  }
  return kokoroState.config;
};

export const isKokoroInitialized = (): boolean => {
  return kokoroState?.isInitialized ?? false;
};

export const generateAudio = async (
  text: string,
  voice: Voices,
): Promise<AudioResult> => {
  if (!kokoroState?.isInitialized) {
    throw new Error("Kokoro not initialized. Call initKokoro() first.");
  }

  logger.debug({ text, voice }, "Starting audio generation with Kokoro");

  const splitter = new TextSplitterStream();
  const stream = kokoroState.tts.stream(splitter, {
    voice,
  });

  splitter.push(text);
  splitter.close();

  const output: { text: string; phonemes: string; audio: { toWav: () => ArrayBuffer; audio: { length: number; audio: Float32Array; sampling_rate: number } } }[] = [];
  for await (const audio of stream) {
    output.push({
      text: audio.text,
      phonemes: audio.phonemes,
      audio: {
        toWav: audio.audio.toWav,
        audio: {
          length: audio.audio.audio.length,
          audio: audio.audio.audio,
          sampling_rate: audio.audio.sampling_rate
        }
      }
    });
  }

  const audioBuffers: ArrayBuffer[] = [];
  let audioLength = 0;

  for (const audio of output) {
    audioBuffers.push(audio.audio.toWav());
    audioLength += audio.audio.audio.length / audio.audio.audio.sampling_rate;
  }

  const mergedAudioBuffer = concatWavBuffers(audioBuffers);

  logger.debug({ text, voice, audioLength }, "Audio generated with Kokoro");

  return {
    audio: mergedAudioBuffer,
    audioLength: audioLength,
  };
};

export const concatWavBuffers = (buffers: ArrayBuffer[]): ArrayBuffer => {
  if (buffers.length === 0) {
    throw new Error("Cannot concatenate empty buffer array");
  }

  const header = Buffer.from(buffers[0].slice(0, 44));
  let totalDataLength = 0;

  const dataParts = buffers.map((buf) => {
    const b = Buffer.from(buf);
    const data = b.slice(44);
    totalDataLength += data.length;
    return data;
  });

  header.writeUInt32LE(36 + totalDataLength, 4);
  header.writeUInt32LE(totalDataLength, 40);

  const result = Buffer.concat([header, ...dataParts]);
  return result.buffer.slice(result.byteOffset, result.byteOffset + result.byteLength);
};

export const getAvailableVoices = (): Voices[] => {
  return Object.values(VoiceEnum);
};

export const getVoiceInfo = (): Record<Voices, { name: string; gender: string; accent: string }> => {
  return {
    [VoiceEnum.AF_BELLA]: { name: "Bella", gender: "Female", accent: "African" },
    [VoiceEnum.AF_NICOLE]: { name: "Nicole", gender: "Female", accent: "African" },
    [VoiceEnum.AF_SARAH]: { name: "Sarah", gender: "Female", accent: "African" },
    [VoiceEnum.AM_ADAM]: { name: "Adam", gender: "Male", accent: "American" },
    [VoiceEnum.AM_MICHAEL]: { name: "Michael", gender: "Male", accent: "American" },
    [VoiceEnum.BF_EMMA]: { name: "Emma", gender: "Female", accent: "British" },
    [VoiceEnum.BF_ISABELLA]: { name: "Isabella", gender: "Female", accent: "British" },
    [VoiceEnum.BM_GEORGE]: { name: "George", gender: "Male", accent: "British" },
    [VoiceEnum.BM_LEWIS]: { name: "Lewis", gender: "Male", accent: "British" }
  };
};

export const isValidVoice = (voice: string): voice is Voices => {
  return Object.values(VoiceEnum).includes(voice as VoiceEnum);
};

export const resetKokoro = (): void => {
  kokoroState = null;
  logger.debug("Kokoro state reset");
};

export const getTTSInstance = (): KokoroTTS => {
  if (!kokoroState?.isInitialized) {
    throw new Error("Kokoro not initialized. Call initKokoro() first.");
  }

  return kokoroState.tts;
};
