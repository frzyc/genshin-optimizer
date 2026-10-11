// [AI-Support] Temporary config so the character page perf harness can run in jsdom. Delete with the [AI-Support] commit.
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/libs/gi/page-characters',
  plugins: [nxViteTsPaths()],
  test: {
    name: 'gi-page-characters',
    watch: false,
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    testTimeout: 300_000,
  },
})
