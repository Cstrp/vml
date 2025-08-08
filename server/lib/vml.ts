import { initializeOpenverse } from "./openverse";
import { initializeWhisper } from "./whisper";
import { initializeKokoro } from "./kokoro";
import { initializeFFmpeg } from "./ffmpeg";
import { initializePixels } from "./pixels";
import { logger } from '../utils'

import { createWriteStream, unlink } from "node:fs";
import { v4 as uuid4 } from "uuid";
import type http from "node:http";
import { join } from "node:path";
import https from "node:https";

export const vml = (pixelsApiKey: string, openverseApiKey: string) => {

  const createVideo = async (id: string, config: any, scenes: any) => {
    let totalDuration: number = 0;
    const temporaryFiles = [];
    const excludeIds = [];

    const orientation = config.orientation || OrientationEnum.PORTRAIT;
    let idx: number = 0;

    for (const scene of scenes) {
      const audio = await initializeKokoro(scene.text, config.voice, {});

      let { len } = audio;

      const { audio: stream } = audio;

      if (idx + 1 === scenes.length && config.padding_back) {
        len += config.padding_back / 1000;
      }

      const id = uuid4();

      const wavFile = `${id}.wav`;
      const mp3File = `${id}.mp3`;
      const mp4File = `${id}.mp4`;

      const wavFilePath = join(config.output, wavFile);
      const mp3FilePath = join(config.output, mp3File);
      const mp4FilePath = join(config.output, mp4File);

      temporaryFiles.push(mp4FilePath, wavFilePath, mp3FilePath);

      const { saveNormalizedAudio } = await initializeFFmpeg();

      await saveNormalizedAudio(stream, wavFilePath);

      const whisper = await initializeWhisper({ model: 'Xenova/whisper-base' })
      const captions = await whisper(wavFilePath);

      const { fetchPixelsVideo } = await initializePixels({ apiKey: pixelsApiKey })

      const video = await fetchPixelsVideo({ q: scene.q, orientation, excludeIds: [], minDurationSeconds: len, timeout: 0 });

      logger.debug({ video }, "Fetched video from Pexels");

      await new Promise<void>((res, rej) => {
        const stream = createWriteStream(mp4FilePath);

        https.get(video?.url ?? '', (response: http.IncomingMessage) => {
          if (response.statusCode !== 200) {
            rej(new Error(`Failed to download video: ${response.statusCode}`));
            return;
          }

          response.pipe(stream);

          stream.on('finish', () => {
            stream.close();
            logger.debug({ mp4FilePath }, "Video downloaded successfully");
            res();
          })
            .on('error', (error) => {
              unlink(mp4FilePath, () => { });
              logger.error({ error }, "Error downloading video");
              rej(error);
            })
        })

      })

      excludeIds.push(video?.id);

      scenes.push({
        captions,
        video: `http://localhost:3000/video/${mp4File}`,
        audio: {
          url: `http://localhost:3000/audio/${mp3File}`,
          duration: len,
        }
      })

      totalDuration += len;
      idx++
    }

    if (config.padding_back) {
      totalDuration += config.padding_back / 1000;
    }

    const { fetchOpenverseAudio } = await initializeOpenverse({ apiKey: openverseApiKey });
    const music = await fetchOpenverseAudio({ q: 'lofi', length: totalDuration });

    // TODO: Implement music integration
    // TODO: Implement Video rendering

    logger.info({ music }, "Fetched background music");

    return id
  }

  return { createVideo }
}
