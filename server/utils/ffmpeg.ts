import ffmpeg from "fluent-ffmpeg";

class FFMpeg {
  private static instance: FFMpeg;
  private initialized = false;

  public static getInstance(): FFMpeg {
    if (!FFMpeg.instance) {
      FFMpeg.instance = new FFMpeg();
    }
    return FFMpeg.instance;
  }

  public async init(): Promise<DEFAULT_RESPONSE> {
    if (this.initialized) {
      return { success: true, message: "FFmpeg already initialized" };
    }
    try {
      const installer = await import("@ffmpeg-installer/ffmpeg");
      ffmpeg.setFfmpegPath(installer.path);
      this.initialized = true;
      console.info("FFmpeg initialized with path:", installer.path);
      return { success: true, message: "FFmpeg initialized successfully" };
    } catch (error) {
      console.error("Failed to initialize ffmpeg:", error);
      return { success: false, message: "Failed to initialize ffmpeg" };
    }
  }

  public mergeAudioVideo(
    videoPath: string,
    audioPath: string,
    outputPath: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(videoPath)
        .input(audioPath)
        .outputOptions("-c:v copy", "-c:a aac", "-shortest")
        .output(outputPath)
        .on("end", () => resolve(outputPath))
        .on("error", reject)
        .run();
    });
  }

  public produceVideo(
    bgVideoPath: string,
    audioPath: string,
    outputPath: string,
    durationSecs: number,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      ffmpeg()
        .input(bgVideoPath)
        .inputOptions(["-stream_loop -1"])
        .input(audioPath)
        .videoFilter("scale=-2:1080")
        .outputOptions([
          `-t ${durationSecs}`,
          "-c:v libx264",
          "-preset fast",
          "-crf 23",
          "-c:a aac",
          "-shortest",
          "-movflags +faststart",
        ])
        .output(outputPath)
        .on("end", () => resolve(outputPath))
        .on("error", reject)
        .run();
    });
  }

  public concatenateVideos(
    paths: string[],
    outputPath: string,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const command = ffmpeg();
      for (const p of paths) {
        command.input(p);
      }
      command
        .on("end", () => resolve(outputPath))
        .on("error", reject)
        .mergeToFile(outputPath, "./tmp");
    });
  }
}

const ffmpegInstance = FFMpeg.getInstance();

export { ffmpegInstance };
