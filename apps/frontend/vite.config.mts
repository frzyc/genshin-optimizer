/// <reference types="vitest" />
import { resolve } from 'path'
import { defineConfig, normalizePath } from 'vite'

import react from '@vitejs/plugin-react'
// viteStaticCopy contains some `require`, so we need to have our config as .mts instead of .ts.
// https://vitejs.dev/guide/troubleshooting.html#this-package-is-esm-only
import { viteStaticCopy } from 'vite-plugin-static-copy'
import viteTsConfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  base: '',
  cacheDir: '../../node_modules/.vite/frontend',

  server: {
    port: 4200,
    host: 'localhost',
    // Allows workers to fetch the needed .ts file
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
    // Enables proper hot module reloading
    react({
      include: '**/*.tsx',
    }),
    // Nx executor for vite does not support `assets` prop for copying files.
    // So we need to do it with this plugin. This works for both `build` and `serve`.
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(resolve('libs/gi/localization/assets/locales')),
          dest: 'assets',
        },
        {
          src: normalizePath(resolve('libs/gi/dm-localization/assets/locales')),
          dest: 'assets',
        },
        {
          src: normalizePath(
            resolve('libs/gi/silly-wisher-names/assets/locales')
          ),
          dest: 'assets',
        },
        {
          src: normalizePath(resolve('apps/frontend/assets')),
          dest: '',
        },
      ],
      // Force page to reload if we change any of the above files
      watch: {
        reloadPageOnChange: true,
      },
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
