import type { OrientationEnum } from "../remotion";

export interface VideoSearchOptions {
  searchTerms: string[];
  minDurationSeconds: number;
  excludeIds?: string[];
  orientation?: OrientationEnum;
  timeout?: number;
  retryCounter?: number;
}
