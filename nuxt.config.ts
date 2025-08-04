import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/tailwind.css', '~/assets/css/font.css', '~/assets/css/utils.css'],

  vite: {
    plugins: [
      tailwindcss(),
    ],
  },

  nitro: {
    routeRules: {
      "/**": {
        headers: {
          "X-Frame-Options": "DENY",
          "X-Content-Type-Options": "nosniff",
          "Referrer-Policy": "strict-origin-when-cross-origin",
          "X-XSS-Protection": "1; mode=block",
          "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
          "Content-Security-Policy": 'false'
        },
      },
    },
    experimental: { tasks: true, asyncContext: true, openAPI: true },
    scheduledTasks: {
      "0 12 * * * *": ["app:health-check"], // every day at 12:00
      // "0 0 * * 0": ["task:name"], // every Sunday at 00:00
      // "*/5 * * * *": ["task:name"], // every 5 minutes
      // "0 12 * * 1-5": ["task:name"], // every weekday at 12:00
      // "0 0 1 * *": ["task:name"], // first day of every month at 00:00
    },
    // hooks: {
    //   'dev:reload': async () => await import('onnxruntime-node')
    // }
  },

  runtimeConfig: {
    public: {
      API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:3000/api',
      PEXELS_API_KEY: process.env.PEXELS_API_KEY || 'demo',

      whisper: {
        RUNNING_IN_DOCKER: process.env.RUNNING_IN_DOCKER === 'true',
        WHISPER_INSTALL_PATH: process.env.WHISPER_INSTALL_PATH,
        WHISPER_VERSION: process.env.WHISPER_VERSION || 'v1.5.4',
        WHISPER_VERBOSE: process.env.WHISPER_VERBOSE === 'true',
        WHISPER_MODEL_PATH: process.env.WHISPER_MODEL_PATH,
        WHISPER_MODEL: process.env.WHISPER_MODEL || 'base.en',
      },

      DATA_DIR_PATH: process.env.WHISPER_DATA_DIR_PATH,
      PRODUCTION_MODE: process.env.PRODUCTION_MODE === 'true',
      DEMO_MODE: process.env.DEMO_MODE === 'true',
      VIDEO_CACHE_SIZE_IN_BYTES: parseInt(process.env.VIDEO_CACHE_SIZE_IN_BYTES || '104857600', 10),
      MAX_CONCURRENT_VIDEOS: parseInt(process.env.MAX_CONCURRENT_VIDEOS || '5', 10),
    },

    openai: {
      MAX_CONCURRENCY: parseInt(process.env.OPENAI_MAX_CONCURRENCY || '2', 10),
      MAX_RETRIES: parseInt(process.env.OPENAI_MAX_RETRIES || '6', 10),
      TEMPERATURE: parseFloat(process.env.OPENAI_TEMPERATURE || '0.0'),
      API_KEY: process.env.OPENAI_API_KEY,
      MODEL: process.env.OPENAI_MODEL,
    },

    google: {
      MAX_CONCURRENCY: parseInt(process.env.GOOGLE_MAX_CONCURRENCY || '2', 10),
      MAX_RETRIES: parseInt(process.env.GOOGLE_MAX_RETRIES || '6', 10),
      TEMPERATURE: parseFloat(process.env.GOOGLE_TEMPERATURE || '0.0'),
      API_KEY: process.env.GOOGLE_API_KEY,
      MODEL: process.env.GOOGLE_MODEL,
    },

    ollama: {
      MAX_CONCURRENCY: parseInt(process.env.OLLAMA_MAX_CONCURRENCY || '2', 10),
      MAX_RETRIES: parseInt(process.env.OLLAMA_MAX_RETRIES || '6', 10),
      TEMPERATURE: parseFloat(process.env.OLLAMA_TEMPERATURE || '0.0'),
      BASE_URL: process.env.OLLAMA_BASE_URL || 'http://localhost:11434',
      MODEL: process.env.OLLAMA_MODEL || 'qwen2.5',
    }


  },

  modules: [
    '@nuxt/eslint',
    '@nuxt/fonts',
    '@nuxt/icon',
    '@nuxt/image',
    '@nuxt/scripts',
    '@nuxt/test-utils',
    '@pinia/nuxt',
    'pinia-plugin-persistedstate',
    '@nuxtjs/color-mode',
    '@nuxtjs/robots',
    '@formkit/auto-animate',
    'shadcn-nuxt',
    '@nuxtjs/i18n',
    'v-wave/nuxt',
    'nuxt-delay-hydration',
  ],

  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: "",
    /**
     * Directory that the component lives in.
     * @default "./app/components/ui"
     */
    componentDir: "./app/components/ui",
  },


})
