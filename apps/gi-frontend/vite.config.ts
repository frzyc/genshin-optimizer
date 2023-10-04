import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteTsConfigPaths from 'vite-tsconfig-paths'
import { resolve } from 'path'

export default defineConfig({
  base: '',
  cacheDir: '../../node_modules/.vite/gi-frontend',

  server: {
    port: 4200,
    host: 'localhost',
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [
    react(),
    viteTsConfigPaths({
      root: '../../',
    }),
  ],

  // Uncomment this if you are using workers.
  // worker: {
  //  plugins: [
  //    viteTsConfigPaths({
  //      root: '../../',
  //    }),
  //  ],
  // },

  // Resolve aliases. If we ever alias to non-libs folder, need to update this
  resolve: {
    alias: [
      // e.g. Resolves '@genshin-optimizer/pando' -> 'libs/pando/src'
      { find: /@genshin-optimizer\/(.*)/, replacement: resolve('libs/$1/src') },
    ],
  },

  // Fix reference to node-provided global
  define: {
    global: {},
  },
})
