import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  root: __dirname,
  cacheDir: '../../node_modules/.vite/libs/sr/solver',

  // Uncomment this if you are using workers.
  worker: {
    plugins: () => [nxViteTsPaths()],
  },
})
