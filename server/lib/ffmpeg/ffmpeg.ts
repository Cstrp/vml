import { Readable } from "node:stream";
import { logger } from "../../utils";
import ffmpeg from "fluent-ffmpeg";

export const initializeFFmpeg = async () => {
  const ffmpegCommand = await import('@ffmpeg-installer/ffmpeg');
  const commandPath = ffmpegCommand.path;

  ffmpeg.setFfmpegPath(commandPath);

  logger.info({ ffmpegPath: commandPath }, "FFmpeg path set to");

  const saveNormalizedAudio = async (audio: ArrayBuffer, output: string): Promise<string> => {
    logger.debug({ audio, output }, "Normalize audio for whisper.cpp");

    const stream = new Readable();

    stream.push(Buffer.from(audio));
    stream.push(null);

    return new Promise((res, rej) => {
      ffmpeg().input(stream).audioCodec('pcm_s16le').audioChannels(1).audioFrequency(16000).toFormat('wav')
        .on('end', () => {
          logger.debug("FFmpeg normalization processing complete");
          res(output);
        })
        .on('error', (error) => {
          logger.error({ error }, "FFmpeg normalization processing failed");
          rej(error);
        })
        .save(output);
    })
  }

  const createMP3DataUri = (audio: ArrayBuffer, output: string): Promise<string> => {
    logger.debug({ audio, output }, "Create MP3 data URI");

    const stream = new Readable();

    stream.push(Buffer.from(audio));
    stream.push(null);

    return new Promise((res, rej) => {
      const chunks: Buffer[] = [];

      ffmpeg().input(stream).audioCodec('libmp3lame').audioChannels(2).audioBitrate(128).toFormat('mp3')
        .on('error', (error) => {
          logger.error({ error }, "FFmpeg MP3 processing failed");
          rej(error);
        })
        .pipe()
        .on('data', (chunk: Buffer) => {
          chunks.push(chunk);
        })
        .on('end', () => {
          const buffer = Buffer.concat(chunks);
          if (!buffer.length || buffer.length < 100) {
            return rej(new Error('MP3 output is empty or invalid'));
          }
          const dataUri = `data:audio/mp3;base64,${buffer.toString('base64')}`;
          res(dataUri);
        })
        .on('error', (error) => {
          logger.error({ error }, "FFmpeg MP3 processing failed");
          rej(error);
        })
    })
  }

  const saveToMP3 = (audio: ArrayBuffer, path: string): Promise<string> => {
    logger.debug({ audio, path }, "Save audio to MP3");

    const stream = new Readable();

    stream.push(Buffer.from(audio));
    stream.push(null);

    return new Promise((res, rej) => {
      ffmpeg().input(stream).audioCodec('libmp3lame').audioBitrate(128).audioChannels(2).toFormat('mp3').save(path)
        .on('end', () => {
          logger.debug("FFmpeg MP3 saving complete");
          res(path);
        })
        .on('error', (error) => {
          logger.error({ error }, "FFmpeg MP3 saving failed");
          rej(error);
        })
    })
  }

  return { saveNormalizedAudio, createMP3DataUri, saveToMP3 }
}
