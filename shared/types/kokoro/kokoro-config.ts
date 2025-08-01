import type { KokoroModelPrecision } from "./kokoro-model-precision";

export interface KokoroConfig {
  model: string;
  dtype: KokoroModelPrecision;
  device: "cpu"; // Only "cpu" is supported in node
}
