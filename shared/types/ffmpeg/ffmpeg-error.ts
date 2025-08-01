export interface FFmpegError extends Error {
  code?: string;
  signal?: string;
  cmd?: string;
}
