import type { OrientationEnum } from '../remotion';
import type { Voices } from '../kokoro';
import type { Caption } from '../whisper';

export interface SceneInput {
  text: string;
  searchTerms: string[];
}

export interface RenderConfig {
  orientation?: OrientationEnum;
  voice?: Voices;
  paddingBack?: number;
  captionBackgroundColor?: string;
  captionPosition?: 'top' | 'bottom' | 'center';
  musicVolume?: number;
  music?: MusicMoodEnum;
}

export interface Scene {
  captions: Caption[];
  video: string;
  audio: {
    url: string;
    duration: number;
  };
}

export interface VideoCreatorConfig {
  tempDirPath: string;
  videosDirPath: string;
  port: number;
  maxConcurrentVideos?: number;
}

export interface QueueItem {
  sceneInput: SceneInput[];
  config: RenderConfig;
  id: string;
  startTime: Date;
}

export interface VideoInfo {
  id: string;
  status: VideoStatus;
  createdAt?: Date;
  duration?: number;
  scenes?: number;
  title?: string;
  videoUrl?: string;
  progress?: number;
  error?: string;
  config?: RenderConfig;
}

export type VideoStatus = 'processing' | 'ready' | 'failed' | 'queued' | 'completed';

export enum MusicMoodEnum {
  UPBEAT = 'upbeat',
  CALM = 'calm',
  DRAMATIC = 'dramatic',
  ENERGETIC = 'energetic',
  PEACEFUL = 'peaceful',
  SUSPENSEFUL = 'suspenseful'
}

export type MusicTag = `${MusicMoodEnum}`;

export interface MusicForVideo {
  id: string;
  url: string;
  duration: number;
  mood: MusicMoodEnum;
  title: string;
}

export interface VideoCreateOptions {
  scenes: SceneInput[];
  config: RenderConfig;
}

export interface DownloadProgress {
  videoId: string;
  sceneIndex: number;
  bytesDownloaded: number;
  totalBytes?: number;
}

export interface VideoCreatorError extends Error {
  videoId?: string;
  sceneIndex?: number;
  operation?: string;
}
