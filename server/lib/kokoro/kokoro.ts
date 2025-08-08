import type { KokoroModelPrecision, Voices } from '../../../shared'
import { logger } from '../../utils';

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-expect-error
import { KokoroTTS, TextSplitterStream } from "kokoro-js";

const KOKORO_MODEL = "onnx-community/Kokoro-82M-v1.0-ONNX";

export const initializeKokoro = async (text: string, voice: Voices, config: { dtype?: KokoroModelPrecision; device?: 'cpu' }) => {
  const tts = await KokoroTTS.from_pretrained(KOKORO_MODEL, {
    dtype: config.dtype ?? 'fp16',
    device: config.device,
  });

  const splitter = new TextSplitterStream();
  const stream = tts.stream(splitter, { voice });

  splitter.push(text);
  splitter.close();

  const output: {
    text: string;
    phonemes: string;
    audio: {
      sampling_rate: number;
      toWav: () => ArrayBuffer;
      audio: {
        length: number;
        sampling_rate: number;
      };
    };
  }[] = [];

  for await (const audio of stream) {
    output.push({
      text: audio.text,
      phonemes: audio.phonemes,
      audio: {
        toWav: audio.audio.toWav,
        sampling_rate: 0,
        audio: {
          length: audio.audio.audio.length,
          sampling_rate: audio.audio.sampling_rate,
        },
      },
    });
  }

  const audioBuffers: ArrayBuffer[] = []
  let len: number = 0;

  for (const audio of output) {
    audioBuffers.push(audio.audio.toWav());
    len += audio.audio.audio.length / audio.audio.sampling_rate;
  }

  const mergeAudioBuffer = (): ArrayBuffer => {
    const header = Buffer.from(audioBuffers[0]!.slice(0, 44));
    let totalDataLength = 0;

    const dataParts = audioBuffers.map((buffer) => {
      const b = Buffer.from(buffer);
      const data = b.slice(44);
      totalDataLength += data.length;
      return data;
    });

    header.writeUInt32LE(36 + totalDataLength, 4);
    header.writeUInt32LE(totalDataLength, 40);

    const mergedBuffer = Buffer.concat([header, ...dataParts]);
    return mergedBuffer.buffer.slice(mergedBuffer.byteOffset, mergedBuffer.byteOffset + mergedBuffer.byteLength);
  }

  const mergedAudioBuffer = mergeAudioBuffer();

  logger.debug({ text, voice, audioLength: len }, 'Merged audio buffer, made via kokoro-js');

  return { audio: mergedAudioBuffer, len }

}
