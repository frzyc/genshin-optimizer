import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    cache: {
      dir: '../../../node_modules/.vitest',
    },
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
  resolve: {
    alias: [
      // e.g. Resolves '@genshin-optimizer/pando/engine' -> 'libs/pando/engine/src'
      {
        find: /@genshin-optimizer\/([a-zA-Z0-9-]*)\/([a-zA-Z0-9-]*)/,
        replacement: resolve('libs/$1/$2/src'),
      },
    ],
  },
})
