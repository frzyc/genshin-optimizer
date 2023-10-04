import { resolve } from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    cache: {
      dir: '../../node_modules/.vitest',
    },
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
  },
  resolve: {
    alias: [
      // e.g. Resolves '@genshin-optimizer/pando' -> 'libs/pando/src'
      { find: /@genshin-optimizer\/(.*)/, replacement: resolve('libs/$1/src') },
    ],
  },
})
