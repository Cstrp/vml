import { fileURLToPath } from "node:url";

export default defineNuxtConfig({
  experimental: { inlineRouteRules: true },
  compatibilityDate: "latest",
  devtools: { enabled: true },
  features: { devLogs: true },

  modules: [
    "pinia-plugin-unstorage",
    "@nuxt/eslint",
    "@nuxt/fonts",
    "@pinia/nuxt",
    "@nuxthub/core",
  ],

  hooks: {},

  alias: {
    "@/prisma": fileURLToPath(new URL("./lib/prisma", import.meta.url)),
  },

  hub: {
    cache: true,
    blob: true,
  },

  nitro: {
    analyze: import.meta.dev ? { brotliSize: true, gzipSize: true } : false,
    experimental: { asyncContext: true, websocket: true },
    minify: !import.meta.dev,
    timing: import.meta.dev,
    externals: {
      external: [
        "remotion",
        "react",
        "react-dom",
        "@remotion/bundler",
        "@remotion/renderer",
        "@remotion/install-whisper-cpp",
        "kokoro-js",
        "@huggingface/transformers",
        "onnxruntime-node",
        "onnxruntime-web",
      ],
    },
  },

  vite: {
    optimizeDeps: {
      exclude: ["@prisma/client"],
    },
    ssr: {
      external: [
        "@prisma/client",
        "remotion",
        "react",
        "react-dom",
        "@remotion/bundler",
        "@remotion/renderer",
        "@remotion/install-whisper-cpp",
        "kokoro-js",
        "@huggingface/transformers",
        "onnxruntime-node",
        "onnxruntime-web",
      ],
    },
  },
});
