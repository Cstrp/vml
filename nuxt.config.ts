import tailwindcss from '@tailwindcss/vite'

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  css: ['~/assets/css/tailwind.css'],

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
          "Content-Security-Policy":
            "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'",
        },
      },
    },
    experimental: { tasks: true, asyncContext: true },
    scheduledTasks: {
      // "0 12 * * * *": ["task:name"], // every day at 12:00
      // "0 0 * * 0": ["task:name"], // every Sunday at 00:00
      // "*/5 * * * *": ["task:name"], // every 5 minutes
      // "0 12 * * 1-5": ["task:name"], // every weekday at 12:00
      // "0 0 1 * *": ["task:name"], // first day of every month at 00:00
    },
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
