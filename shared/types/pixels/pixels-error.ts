export interface PixelsError extends Error {
  status?: number;
  statusText?: string;
}
