export const whisperModels: Record<string, number[]> = {
  // Original checkpoints
  'Xenova/whisper-tiny': [41, 152],
  'Xenova/whisper-base': [77, 291],
  'Xenova/whisper-small': [249],
  'Xenova/whisper-medium': [776],

  // Distil Whisper (English-only)
  'distil-whisper/distil-medium.en': [402],
  'distil-whisper/distil-large-v2': [767],
};
