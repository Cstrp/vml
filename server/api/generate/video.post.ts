import { mkdir } from "node:fs/promises";
import { join } from "node:path";

const TMP_DIR = join(process.cwd(), ".tmp");

export default defineEventHandler(async (event) => {
  const { compositionId = "MyVideo", props = {} } =
    await readBody<VideoRenderRequest>(event);

  await mkdir(TMP_DIR, { recursive: true });
  const outputPath = join(TMP_DIR, `render-${Date.now()}.mp4`);

  return remotionInstance.render(compositionId, props, outputPath);
});
