/// <reference types="vitest" />
import { resolve } from 'path'
import { defineConfig, normalizePath } from 'vite'

import { viteStaticCopy } from 'vite-plugin-static-copy'
import viteTsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  base: '',
  cacheDir: '../../node_modules/.vite/frontend',

  server: {
    port: 4200,
    host: 'localhost',
    fs: {
      allow: ['../../'],
    },
  },

  preview: {
    port: 4300,
    host: 'localhost',
  },

  plugins: [
    viteTsConfigPaths({
      root: '../../',
    }),
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(resolve('libs/gi/localization/assets/locales')),
          dest: 'assets',
        },
      ],
    }),
  ],

  define: {
    'process.env': process.env,
  },

  // Resolve aliases. If we ever alias to non-libs folder, need to update this
  resolve: {
    alias: [
      // e.g. Resolves '@genshin-optimizer/pando/engine' -> 'libs/pando/engine/src'
      {
        find: /@genshin-optimizer\/([a-z-]*)\/([a-z-]*)/,
        replacement: resolve('libs/$1/$2/src'),
      },
    ],
  },

  // Uncomment this if you are using workers.
  worker: {
    plugins: [
      viteTsConfigPaths({
        root: '../../',
      }),
    ],
  },
})
