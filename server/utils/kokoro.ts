import { KokoroTTS, type GenerateOptions } from "kokoro-js";

const MODEL_ID = "onnx-community/Kokoro-82M-ONNX";

class Kokoro {
  private static instance: Kokoro;
  private tts?: KokoroTTS;
  private initialized = false;

  public static getInstance(): Kokoro {
    if (!Kokoro.instance) {
      Kokoro.instance = new Kokoro();
    }
    return Kokoro.instance;
  }

  public async init(dtype: kokoroModelPrecision): Promise<DEFAULT_RESPONSE> {
    if (this.initialized) {
      return { success: true, message: "Kokoro TTS already initialized" };
    }
    try {
      this.tts = await KokoroTTS.from_pretrained(MODEL_ID, {
        dtype,
        device: "cpu",
      });
      this.initialized = true;
      console.info("Kokoro TTS initialized successfully");
      return { success: true, message: "Kokoro TTS initialized successfully" };
    } catch (error) {
      console.error("Failed to initialize Kokoro TTS:", error);
      return { success: false, message: "Failed to initialize Kokoro TTS" };
    }
  }

  public async synthesize(
    text: string,
    voice: NonNullable<GenerateOptions["voice"]>,
    outputPath: string,
  ): Promise<SynthesisResult> {
    if (!this.tts) {
      throw new Error("Kokoro TTS is not initialized");
    }
    const audio = await this.tts.generate(text, { voice });
    const durationMs = Math.round(
      (audio.audio.length / audio.sampling_rate) * 1000,
    );
    await audio.save(outputPath);
    return { outputPath, durationMs };
  }
}

const kokoroInstance = Kokoro.getInstance();

export { kokoroInstance };
