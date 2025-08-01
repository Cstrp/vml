import type { RemotionConfig } from "./remotion-config";

export interface RemotionState {
  bundled: string;
  config: RemotionConfig;
  isInitialized: boolean;
}
