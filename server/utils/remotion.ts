import { bundle } from "@remotion/bundler";
import { existsSync } from "node:fs";
import { join } from "node:path";
import {
  renderMedia,
  selectComposition,
  ensureBrowser,
} from "@remotion/renderer";

const ENTRY_POINT = join(process.cwd(), "remotion", "index.tsx");

class Remotion {
  private static instance: Remotion;
  private initialized = false;
  private bundleLocation: string | null = null;

  public static getInstance(): Remotion {
    if (!Remotion.instance) {
      Remotion.instance = new Remotion();
    }
    return Remotion.instance;
  }

  public async init(): Promise<DEFAULT_RESPONSE> {
    if (this.initialized) {
      return { success: true, message: "Remotion already initialized" };
    }
    if (!existsSync(ENTRY_POINT)) {
      if (import.meta.dev) {
        console.warn(
          "[Remotion] Entry point not found, skipping init:",
          ENTRY_POINT,
        );
      }
      return { success: false, message: "Remotion entry point not found" };
    }
    try {
      await ensureBrowser();
      this.bundleLocation = await bundle({
        entryPoint: ENTRY_POINT,
        webpackOverride: (config) => ({
          ...config,
          externals: {
            ...(typeof config.externals === "object" &&
            !Array.isArray(config.externals)
              ? (config.externals as Record<string, string>)
              : {}),
            "onnxruntime-node": "commonjs onnxruntime-node",
            "onnxruntime-web": "commonjs onnxruntime-web",
          },
          resolve: {
            ...config.resolve,
            modules: [
              ...((config.resolve?.modules as string[] | undefined) ?? [
                "node_modules",
              ]),
              join(process.cwd(), "node_modules"),
            ],
          },
        }),
      });
      this.initialized = true;
      console.info("Remotion initialized, bundle at:", this.bundleLocation);
      return { success: true, message: "Remotion initialized successfully" };
    } catch (error) {
      console.error("Failed to initialize Remotion:", error);
      return { success: false, message: "Failed to initialize Remotion" };
    }
  }

  public async render(
    compositionId: string,
    props: Record<string, unknown>,
    outputPath: string,
  ): Promise<RenderResult> {
    if (!this.bundleLocation) {
      throw new Error("Remotion is not initialized");
    }
    const composition = await selectComposition({
      serveUrl: this.bundleLocation,
      id: compositionId,
      inputProps: props,
    });
    await renderMedia({
      composition,
      serveUrl: this.bundleLocation,
      codec: "h264",
      outputLocation: outputPath,
      inputProps: props,
    });
    return { outputPath };
  }
}

const remotionInstance = Remotion.getInstance();

export { remotionInstance };
