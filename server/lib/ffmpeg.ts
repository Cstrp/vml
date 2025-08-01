import { logger } from "../utils/logger";
import { Readable } from "node:stream";
import ffmpeg from "fluent-ffmpeg";
import type {
  FFmpegConfig,
  AudioConversionOptions,
  FFmpegError,
  FFmpegState,
} from "../../shared/types/ffmpeg";



let ffmpegState: FFmpegState | null = null;

export const initFFmpeg = async (config?: Partial<FFmpegConfig>): Promise<void> => {
  try {
    const ffmpegInstaller = await import("@ffmpeg-installer/ffmpeg");

    const defaultConfig: FFmpegConfig = {
      quality: {
        mp3Bitrate: 128,
        channels: 2,
        whisperSampleRate: 16000,
      },
    };

    const mergedConfig = {
      ...defaultConfig,
      ...config,
      quality: {
        ...defaultConfig.quality,
        ...config?.quality,
      },
    };

    const ffmpegPath = config?.ffmpegPath || ffmpegInstaller.path;
    ffmpeg.setFfmpegPath(ffmpegPath);

    ffmpegState = {
      isInitialized: true,
      config: mergedConfig,
      ffmpegPath,
    };

    logger.info("FFmpeg path set to:", ffmpegPath);
    logger.debug("FFmpeg initialized successfully");
  } catch (error) {
    logger.error(error, "Failed to initialize FFmpeg");
    throw new Error("FFmpeg initialization failed");
  }
};


export const getFFmpegConfig = (): FFmpegConfig => {
  if (!ffmpegState?.isInitialized) {
    throw new Error("FFmpeg not initialized. Call initFFmpeg() first.");
  }
  return ffmpegState.config;
};

export const isFFmpegInitialized = (): boolean => {
  return ffmpegState?.isInitialized ?? false;
};


const createAudioStream = (audio: ArrayBuffer): Readable => {
  const inputStream = new Readable();
  inputStream.push(Buffer.from(audio));
  inputStream.push(null);
  return inputStream;
};

export const saveNormalizedAudio = async (
  audio: ArrayBuffer,
  outputPath: string,
): Promise<string> => {
  if (!ffmpegState?.isInitialized) {
    throw new Error("FFmpeg not initialized. Call initFFmpeg() first.");
  }

  logger.debug("Normalizing audio for Whisper");
  const inputStream = createAudioStream(audio);
  const config = ffmpegState.config;

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(inputStream)
      .audioCodec("pcm_s16le")
      .audioChannels(1)
      .audioFrequency(config.quality.whisperSampleRate)
      .toFormat("wav")
      .on("end", () => {
        logger.debug("Audio normalization complete");
        resolve(outputPath);
      })
      .on("error", (error: unknown) => {
        logger.error(error, "Error normalizing audio:");
        reject(error);
      })
      .save(outputPath);
  });
};

export const createMp3DataUri = async (audio: ArrayBuffer): Promise<string> => {
  if (!ffmpegState?.isInitialized) {
    throw new Error("FFmpeg not initialized. Call initFFmpeg() first.");
  }

  const inputStream = new Readable();
  inputStream.push(Buffer.from(audio));
  inputStream.push(null);
  return new Promise((resolve, reject) => {
    const chunk: Buffer[] = [];

    ffmpeg()
      .input(inputStream)
      .audioCodec("libmp3lame")
      .audioBitrate(128)
      .audioChannels(2)
      .toFormat("mp3")
      .on("error", (err) => {
        reject(err);
      })
      .pipe()
      .on("data", (data: Buffer) => {
        chunk.push(data);
      })
      .on("end", () => {
        const buffer = Buffer.concat(chunk);
        resolve(`data:audio/mp3;base64,${buffer.toString("base64")}`);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};

export const saveToMp3 = async (audio: ArrayBuffer, filePath: string): Promise<string> => {
  if (!ffmpegState?.isInitialized) {
    throw new Error("FFmpeg not initialized. Call initFFmpeg() first.");
  }

  const inputStream = new Readable();
  inputStream.push(Buffer.from(audio));
  inputStream.push(null);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(inputStream)
      .audioCodec("libmp3lame")
      .audioBitrate(128)
      .audioChannels(2)
      .toFormat("mp3")
      .save(filePath)
      .on("end", () => {
        logger.debug("Audio conversion complete");
        resolve(filePath);
      })
      .on("error", (err) => {
        reject(err);
      });
  });
};

export const convertAudio = async (
  audio: ArrayBuffer,
  outputPath: string,
  options: AudioConversionOptions = {}
): Promise<string> => {
  if (!ffmpegState?.isInitialized) {
    throw new Error("FFmpeg not initialized. Call initFFmpeg() first.");
  }

  const inputStream = createAudioStream(audio);
  const {
    codec = "libmp3lame",
    bitrate = 128,
    channels = 2,
    sampleRate,
    format = "mp3"
  } = options;

  return new Promise((resolve, reject) => {
    const command = ffmpeg()
      .input(inputStream)
      .audioCodec(codec)
      .audioBitrate(bitrate)
      .audioChannels(channels)
      .toFormat(format);

    if (sampleRate) {
      command.audioFrequency(sampleRate);
    }

    command
      .save(outputPath)
      .on("end", () => {
        logger.debug(`Audio conversion to ${format} complete`);
        resolve(outputPath);
      })
      .on("error", (err: FFmpegError) => {
        logger.error(err, `Error converting audio to ${format}`);
        reject(err);
      });
  });
};


export const getAudioInfo = async (audio: ArrayBuffer): Promise<unknown> => {
  if (!ffmpegState?.isInitialized) {
    throw new Error("FFmpeg not initialized. Call initFFmpeg() first.");
  }

  const inputStream = createAudioStream(audio);

  return new Promise((resolve, reject) => {
    ffmpeg()
      .input(inputStream)
      .ffprobe((err, metadata) => {
        if (err) {
          logger.error(err, "Error getting audio metadata");
          reject(err);
        } else {
          resolve(metadata);
        }
      });
  });
};


export const resetFFmpeg = (): void => {
  ffmpegState = null;
  logger.debug("FFmpeg state reset");
};

export const getFFmpegPath = (): string => {
  if (!ffmpegState?.isInitialized) {
    throw new Error("FFmpeg not initialized. Call initFFmpeg() first.");
  }
  return ffmpegState.ffmpegPath;
};
