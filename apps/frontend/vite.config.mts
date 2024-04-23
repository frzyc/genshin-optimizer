/// <reference types="vitest" />
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { defineConfig, normalizePath } from 'vite'
// viteStaticCopy contains some `require`, so we need to have our config as .mts instead of .ts.
// https://vitejs.dev/guide/troubleshooting.html#this-package-is-esm-only
import { nxViteTsPaths } from '@nx/vite/plugins/nx-tsconfig-paths.plugin'
import { viteStaticCopy } from 'vite-plugin-static-copy'
import pkg from '../../package.json' assert { type: 'json' }

export default defineConfig({
  base: '',
  root: __dirname,
  cacheDir: '../../node_modules/.vite/frontend',

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
    nxViteTsPaths(),
    // Nx executor for vite does not support `assets` prop for copying files.
    // So we need to do it with this plugin. This works for both `build` and `serve`.
    viteStaticCopy({
      targets: [
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
        {
          src: normalizePath(resolve('../../apps/frontend/assets/*')),
          dest: 'assets',
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
    __VERSION__: `"${pkg.version}"`,
  },

  // Uncomment this if you are using workers.
  worker: {
    // https://vitejs.dev/guide/migration#worker-plugins-is-now-a-function
    plugins: () => [nxViteTsPaths()],
  },

  build: {
    outDir: '../../dist/apps/frontend',
    reportCompressedSize: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },

  test: {
    globals: true,
    cache: { dir: '../../node_modules/.vitest' },
    environment: 'jsdom',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: {
      reportsDirectory: '../../coverage/apps/sr-frontend',
      provider: 'v8',
    },
  },
})
