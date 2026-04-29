import { blob } from "hub:blob";

export default defineEventHandler(async (event) => {
  const { limit } = getRouterParams(event);

  const { blobs } = await blob.list({ limit: Number(limit) ?? 10 });

  return blobs;
});
