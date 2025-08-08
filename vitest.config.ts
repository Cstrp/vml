import { defineVitestProject } from '@nuxt/test-utils/config'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    projects: [
      {
        test: {
          name: 'unit',
          include: ['test/{e2e,unit}/*.{test,spec}.ts', 'server/**/*.{test,spec}.ts'],
          environment: 'node',
        },
      },
      defineVitestProject({
        test: {
          name: 'nuxt',
          include: ['test/nuxt/*.{test,spec}.ts', 'server/**/*.{test,spec}.ts'],
          environment: 'nuxt',
        },
      }),
    ],
  },
})
