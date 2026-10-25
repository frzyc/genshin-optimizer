import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/libs/gi/pando-parity',
  plugins: [nxViteTsPaths()],
  test: {
    name: 'gi-pando-parity',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../../coverage/libs/gi/pando-parity',
      provider: 'v8',
    },
  },
})
