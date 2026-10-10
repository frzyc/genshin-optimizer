// viteStaticCopy contains some `require`, so we need to have our config as .mts instead of .ts.
// https://vitejs.dev/guide/troubleshooting.html#this-package-is-esm-only

import { resolve } from 'node:path'
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import { defineConfig, normalizePath } from 'vite'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import pkg from '../../package.json' with { type: 'json' }

export default defineConfig(() => ({
  base: '',
  root: __dirname,
  cacheDir: '../../node_modules/.vite/apps/gi-frontend',

  server: {
    port: 4210,
    host: 'localhost',
    fs: {
      allow: ['../..'],
    },
  },

  preview: {
    port: 4310,
    host: 'localhost',
  },

  plugins: [
    react(),
    nxViteTsPaths(),
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(
            resolve('../../libs/common/localization/assets/locales')
          ),
          dest: 'assets',
        },
        {
          src: normalizePath(
            resolve('../../libs/gi/localization/assets/locales')
          ),
          dest: 'assets',
        },
        {
          src: normalizePath(
            resolve('../../libs/gi/dm-localization/assets/locales')
          ),
          dest: 'assets',
        },
        {
          src: normalizePath(
            resolve('../../libs/gi/silly-wisher-names/assets/locales')
          ),
          dest: 'assets',
        },
      ],
      watch: {
        reloadPageOnChange: true,
      },
    }),
  ],

  define: {
    'process.env': process.env,
    __VERSION__: `"${pkg.version}"`,
  },

  worker: {
    plugins: () => [nxViteTsPaths()],
  },

  build: {
    outDir: '../../dist/apps/gi-frontend',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },

  test: {
    watch: false,
    globals: true,
    environment: 'jsdom',
    passWithNoTests: true,
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/gi-frontend',
      provider: 'v8',
    },
  },
}))
