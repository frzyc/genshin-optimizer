import { defineConfig } from 'vite'

import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'

export default defineConfig({
  root: __dirname,
  cacheDir: '../../../node_modules/.vite/libs/zzz/formula',

  plugins: [nxViteTsPaths()],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [ nxViteTsPaths() ],
  // },

  test: {
    name: 'zzz-formula',
    watch: false,
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../../coverage/libs/zzz/formula',
      provider: 'v8',
    },
  },
})
