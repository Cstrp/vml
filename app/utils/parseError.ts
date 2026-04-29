export function parseError(e: unknown, fallback: string): string {
  if (!e || typeof e !== "object") return fallback;
  const data = (e as Record<string, unknown>)["data"];
  if (!data || typeof data !== "object") return fallback;
  const message = (data as Record<string, unknown>)["message"];
  return typeof message === "string" ? message : fallback;
}
