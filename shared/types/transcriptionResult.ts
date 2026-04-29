export type TranscriptionSegment = {
  text: string;
  startMs: number;
  endMs: number;
};

export type TranscriptionResult = {
  text: string;
  segments: TranscriptionSegment[];
};
