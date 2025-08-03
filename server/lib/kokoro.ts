import type { AudioResult, KokoroConfig, Voices } from "../../shared";
import { KokoroTTS, TextSplitterStream } from "kokoro-js";
import { VoiceEnum } from "../../shared";
import { logger } from "../utils";

const KOKORO_MODEL = "onnx-community/Kokoro-82M-v1.0-ONNX";

export const generateAudio = async (text: string, voice: Voices, cfg?: Partial<KokoroConfig>): Promise<AudioResult> => {
  try {
    logger.debug({ text, voice, cfg }, "Starting Kokoro TTS audio generation");

    const tts = await KokoroTTS.from_pretrained(KOKORO_MODEL, {
      dtype: cfg?.dtype || 'fp16',
      device: cfg?.device || "cpu",
    });

    const splitter = new TextSplitterStream();
    const stream = tts.stream(splitter, {
      voice,
    });

    splitter.push(text);
    splitter.close();

    const output = [];

    for await (const audio of stream) {
      output.push(audio);
    }

    const audioBuffers: ArrayBuffer[] = [];
    let audioLength = 0;

    for (const audio of output) {
      audioBuffers.push(audio.audio.toWav());
      audioLength += audio.audio.audio.length / audio.audio.sampling_rate;
    }

    const mergedAudioBuffer = concatWavBuffers(audioBuffers);

    logger.debug({ text, voice, audioLength }, "Audio generated with Kokoro");

    return {
      audio: mergedAudioBuffer,
      audioLength: audioLength,
    };
  } catch (error) {
    logger.error({ text, voice, error }, "Failed to generate audio with Kokoro");

    if (error instanceof Error) {
      if (error.message.includes('Protobuf parsing failed')) {
        throw new Error('Kokoro model file is corrupted. Please restart the server to re-download the model.');
      }
      if (error.message.includes('failed to fetch')) {
        throw new Error('Failed to download Kokoro model. Please check your internet connection.');
      }
    }

    throw error;
  }
};

export const concatWavBuffers = (buffers: ArrayBuffer[]): ArrayBuffer => {
  if (buffers.length === 0) {
    throw new Error("Cannot concatenate empty buffer array");
  }

  if (buffers[0]!.byteLength < 44) {
    throw new Error("Invalid WAV buffer: too small to contain header");
  }

  const header = Buffer.from(buffers[0]!.slice(0, 44));
  let totalDataLength = 0;

  const dataParts = buffers.map((buf) => {
    if (buf.byteLength < 44) {
      throw new Error("Invalid WAV buffer: too small to contain header");
    }

    const b = Buffer.from(buf);
    const data = b.slice(44);
    totalDataLength += data.length;
    return data;
  });

  header.writeUInt32LE(36 + totalDataLength, 4);
  header.writeUInt32LE(totalDataLength, 40);

  const concatenated = Buffer.concat([header, ...dataParts]);

  return concatenated.buffer.slice(concatenated.byteOffset, concatenated.byteOffset + concatenated.byteLength);
}

export const getAvailableVoices = (): Voices[] => {
  return Object.values(VoiceEnum) as Voices[];
}
