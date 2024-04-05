// apps/frontend/vitest.config.mts
import {
  defineConfig as defineConfig2,
  mergeConfig,
} from 'file:///F:/Project/genshin-optimizer-monorepo/node_modules/vitest/dist/config.js'

// apps/frontend/vite.config.mts
import react from 'file:///F:/Project/genshin-optimizer-monorepo/node_modules/@vitejs/plugin-react/dist/index.mjs'
import { viteStaticCopy } from 'file:///F:/Project/genshin-optimizer-monorepo/node_modules/vite-plugin-static-copy/dist/index.js'
import viteTsConfigPaths from 'file:///F:/Project/genshin-optimizer-monorepo/node_modules/vite-tsconfig-paths/dist/index.mjs'
import {
  defineConfig,
  normalizePath,
} from 'file:///F:/Project/genshin-optimizer-monorepo/node_modules/vite/dist/node/index.js'
import { resolve } from 'path'
var vite_config_default = defineConfig({
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
          src: normalizePath(resolve('apps/frontend/assets/*')),
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
  },
  // Resolve aliases. If we ever alias to non-libs folder, need to update this
  resolve: {
    alias: [
      // e.g. Resolves '@genshin-optimizer/pando/engine' -> 'libs/pando/engine/src'
      {
        find: /@genshin-optimizer\/([a-zA-Z0-9-]*)\/([a-zA-Z0-9-]*)/,
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

// apps/frontend/vitest.config.mts
var vitest_config_default = mergeConfig(
  vite_config_default,
  defineConfig2({
    test: {
      globals: true,
      cache: {
        dir: '../../../node_modules/.vitest',
      },
      environment: 'jsdom',
      include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    },
  })
)
export { vitest_config_default as default }
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiYXBwcy9mcm9udGVuZC92aXRlc3QuY29uZmlnLm10cyIsICJhcHBzL2Zyb250ZW5kL3ZpdGUuY29uZmlnLm10cyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2Rpcm5hbWUgPSBcIkY6XFxcXFByb2plY3RcXFxcZ2Vuc2hpbi1vcHRpbWl6ZXItbW9ub3JlcG9cXFxcYXBwc1xcXFxmcm9udGVuZFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiRjpcXFxcUHJvamVjdFxcXFxnZW5zaGluLW9wdGltaXplci1tb25vcmVwb1xcXFxhcHBzXFxcXGZyb250ZW5kXFxcXHZpdGVzdC5jb25maWcubXRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9GOi9Qcm9qZWN0L2dlbnNoaW4tb3B0aW1pemVyLW1vbm9yZXBvL2FwcHMvZnJvbnRlbmQvdml0ZXN0LmNvbmZpZy5tdHNcIjtpbXBvcnQgeyBkZWZpbmVDb25maWcsIG1lcmdlQ29uZmlnIH0gZnJvbSAndml0ZXN0L2NvbmZpZydcbmltcG9ydCB2aXRlQ29uZmlnIGZyb20gJy4vdml0ZS5jb25maWcubWpzJ1xuXG5leHBvcnQgZGVmYXVsdCBtZXJnZUNvbmZpZyhcbiAgdml0ZUNvbmZpZyxcbiAgZGVmaW5lQ29uZmlnKHtcbiAgICB0ZXN0OiB7XG4gICAgICBnbG9iYWxzOiB0cnVlLFxuICAgICAgY2FjaGU6IHtcbiAgICAgICAgZGlyOiAnLi4vLi4vLi4vbm9kZV9tb2R1bGVzLy52aXRlc3QnLFxuICAgICAgfSxcbiAgICAgIGVudmlyb25tZW50OiAnanNkb20nLFxuICAgICAgaW5jbHVkZTogWydzcmMvKiovKi57dGVzdCxzcGVjfS57anMsbWpzLGNqcyx0cyxtdHMsY3RzLGpzeCx0c3h9J10sXG4gICAgfSxcbiAgfSlcbilcbiIsICJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiRjpcXFxcUHJvamVjdFxcXFxnZW5zaGluLW9wdGltaXplci1tb25vcmVwb1xcXFxhcHBzXFxcXGZyb250ZW5kXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ZpbGVuYW1lID0gXCJGOlxcXFxQcm9qZWN0XFxcXGdlbnNoaW4tb3B0aW1pemVyLW1vbm9yZXBvXFxcXGFwcHNcXFxcZnJvbnRlbmRcXFxcdml0ZS5jb25maWcubXRzXCI7Y29uc3QgX192aXRlX2luamVjdGVkX29yaWdpbmFsX2ltcG9ydF9tZXRhX3VybCA9IFwiZmlsZTovLy9GOi9Qcm9qZWN0L2dlbnNoaW4tb3B0aW1pemVyLW1vbm9yZXBvL2FwcHMvZnJvbnRlbmQvdml0ZS5jb25maWcubXRzXCI7Ly8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlc3RcIiAvPlxuaW1wb3J0IHsgcmVzb2x2ZSB9IGZyb20gJ3BhdGgnXG5pbXBvcnQgeyBkZWZpbmVDb25maWcsIG5vcm1hbGl6ZVBhdGggfSBmcm9tICd2aXRlJ1xuXG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3QnXG4vLyB2aXRlU3RhdGljQ29weSBjb250YWlucyBzb21lIGByZXF1aXJlYCwgc28gd2UgbmVlZCB0byBoYXZlIG91ciBjb25maWcgYXMgLm10cyBpbnN0ZWFkIG9mIC50cy5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9ndWlkZS90cm91Ymxlc2hvb3RpbmcuaHRtbCN0aGlzLXBhY2thZ2UtaXMtZXNtLW9ubHlcbmltcG9ydCB7IHZpdGVTdGF0aWNDb3B5IH0gZnJvbSAndml0ZS1wbHVnaW4tc3RhdGljLWNvcHknXG5pbXBvcnQgdml0ZVRzQ29uZmlnUGF0aHMgZnJvbSAndml0ZS10c2NvbmZpZy1wYXRocydcblxuZXhwb3J0IGRlZmF1bHQgZGVmaW5lQ29uZmlnKHtcbiAgYmFzZTogJycsXG4gIGNhY2hlRGlyOiAnLi4vLi4vbm9kZV9tb2R1bGVzLy52aXRlL2Zyb250ZW5kJyxcblxuICBzZXJ2ZXI6IHtcbiAgICBwb3J0OiA0MjAwLFxuICAgIGhvc3Q6ICdsb2NhbGhvc3QnLFxuICAgIC8vIEFsbG93cyB3b3JrZXJzIHRvIGZldGNoIHRoZSBuZWVkZWQgLnRzIGZpbGVcbiAgICBmczoge1xuICAgICAgYWxsb3c6IFsnLi4vLi4vJ10sXG4gICAgfSxcbiAgfSxcblxuICBwcmV2aWV3OiB7XG4gICAgcG9ydDogNDMwMCxcbiAgICBob3N0OiAnbG9jYWxob3N0JyxcbiAgfSxcblxuICBwbHVnaW5zOiBbXG4gICAgdml0ZVRzQ29uZmlnUGF0aHMoe1xuICAgICAgcm9vdDogJy4uLy4uLycsXG4gICAgfSksXG4gICAgLy8gRW5hYmxlcyBwcm9wZXIgaG90IG1vZHVsZSByZWxvYWRpbmdcbiAgICByZWFjdCh7XG4gICAgICBpbmNsdWRlOiAnKiovKi50c3gnLFxuICAgIH0pLFxuICAgIC8vIE54IGV4ZWN1dG9yIGZvciB2aXRlIGRvZXMgbm90IHN1cHBvcnQgYGFzc2V0c2AgcHJvcCBmb3IgY29weWluZyBmaWxlcy5cbiAgICAvLyBTbyB3ZSBuZWVkIHRvIGRvIGl0IHdpdGggdGhpcyBwbHVnaW4uIFRoaXMgd29ya3MgZm9yIGJvdGggYGJ1aWxkYCBhbmQgYHNlcnZlYC5cbiAgICB2aXRlU3RhdGljQ29weSh7XG4gICAgICB0YXJnZXRzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBzcmM6IG5vcm1hbGl6ZVBhdGgocmVzb2x2ZSgnbGlicy9naS9sb2NhbGl6YXRpb24vYXNzZXRzL2xvY2FsZXMnKSksXG4gICAgICAgICAgZGVzdDogJ2Fzc2V0cycsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBzcmM6IG5vcm1hbGl6ZVBhdGgocmVzb2x2ZSgnbGlicy9naS9kbS1sb2NhbGl6YXRpb24vYXNzZXRzL2xvY2FsZXMnKSksXG4gICAgICAgICAgZGVzdDogJ2Fzc2V0cycsXG4gICAgICAgIH0sXG4gICAgICAgIHtcbiAgICAgICAgICBzcmM6IG5vcm1hbGl6ZVBhdGgoXG4gICAgICAgICAgICByZXNvbHZlKCdsaWJzL2dpL3NpbGx5LXdpc2hlci1uYW1lcy9hc3NldHMvbG9jYWxlcycpXG4gICAgICAgICAgKSxcbiAgICAgICAgICBkZXN0OiAnYXNzZXRzJyxcbiAgICAgICAgfSxcbiAgICAgICAge1xuICAgICAgICAgIHNyYzogbm9ybWFsaXplUGF0aChyZXNvbHZlKCdhcHBzL2Zyb250ZW5kL2Fzc2V0cy8qJykpLFxuICAgICAgICAgIGRlc3Q6ICdhc3NldHMnLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIC8vIEZvcmNlIHBhZ2UgdG8gcmVsb2FkIGlmIHdlIGNoYW5nZSBhbnkgb2YgdGhlIGFib3ZlIGZpbGVzXG4gICAgICB3YXRjaDoge1xuICAgICAgICByZWxvYWRQYWdlT25DaGFuZ2U6IHRydWUsXG4gICAgICB9LFxuICAgIH0pLFxuICBdLFxuXG4gIGRlZmluZToge1xuICAgICdwcm9jZXNzLmVudic6IHByb2Nlc3MuZW52LFxuICB9LFxuXG4gIC8vIFJlc29sdmUgYWxpYXNlcy4gSWYgd2UgZXZlciBhbGlhcyB0byBub24tbGlicyBmb2xkZXIsIG5lZWQgdG8gdXBkYXRlIHRoaXNcbiAgcmVzb2x2ZToge1xuICAgIGFsaWFzOiBbXG4gICAgICAvLyBlLmcuIFJlc29sdmVzICdAZ2Vuc2hpbi1vcHRpbWl6ZXIvcGFuZG8vZW5naW5lJyAtPiAnbGlicy9wYW5kby9lbmdpbmUvc3JjJ1xuICAgICAge1xuICAgICAgICBmaW5kOiAvQGdlbnNoaW4tb3B0aW1pemVyXFwvKFthLXpBLVowLTktXSopXFwvKFthLXpBLVowLTktXSopLyxcbiAgICAgICAgcmVwbGFjZW1lbnQ6IHJlc29sdmUoJ2xpYnMvJDEvJDIvc3JjJyksXG4gICAgICB9LFxuICAgIF0sXG4gIH0sXG5cbiAgLy8gVW5jb21tZW50IHRoaXMgaWYgeW91IGFyZSB1c2luZyB3b3JrZXJzLlxuICB3b3JrZXI6IHtcbiAgICBwbHVnaW5zOiBbXG4gICAgICB2aXRlVHNDb25maWdQYXRocyh7XG4gICAgICAgIHJvb3Q6ICcuLi8uLi8nLFxuICAgICAgfSksXG4gICAgXSxcbiAgfSxcbn0pXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTJWLFNBQVMsZ0JBQUFBLGVBQWMsbUJBQW1COzs7QUNDclksU0FBUyxlQUFlO0FBQ3hCLFNBQVMsY0FBYyxxQkFBcUI7QUFFNUMsT0FBTyxXQUFXO0FBR2xCLFNBQVMsc0JBQXNCO0FBQy9CLE9BQU8sdUJBQXVCO0FBRTlCLElBQU8sc0JBQVEsYUFBYTtBQUFBLEVBQzFCLE1BQU07QUFBQSxFQUNOLFVBQVU7QUFBQSxFQUVWLFFBQVE7QUFBQSxJQUNOLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQTtBQUFBLElBRU4sSUFBSTtBQUFBLE1BQ0YsT0FBTyxDQUFDLFFBQVE7QUFBQSxJQUNsQjtBQUFBLEVBQ0Y7QUFBQSxFQUVBLFNBQVM7QUFBQSxJQUNQLE1BQU07QUFBQSxJQUNOLE1BQU07QUFBQSxFQUNSO0FBQUEsRUFFQSxTQUFTO0FBQUEsSUFDUCxrQkFBa0I7QUFBQSxNQUNoQixNQUFNO0FBQUEsSUFDUixDQUFDO0FBQUE7QUFBQSxJQUVELE1BQU07QUFBQSxNQUNKLFNBQVM7QUFBQSxJQUNYLENBQUM7QUFBQTtBQUFBO0FBQUEsSUFHRCxlQUFlO0FBQUEsTUFDYixTQUFTO0FBQUEsUUFDUDtBQUFBLFVBQ0UsS0FBSyxjQUFjLFFBQVEscUNBQXFDLENBQUM7QUFBQSxVQUNqRSxNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLEtBQUssY0FBYyxRQUFRLHdDQUF3QyxDQUFDO0FBQUEsVUFDcEUsTUFBTTtBQUFBLFFBQ1I7QUFBQSxRQUNBO0FBQUEsVUFDRSxLQUFLO0FBQUEsWUFDSCxRQUFRLDJDQUEyQztBQUFBLFVBQ3JEO0FBQUEsVUFDQSxNQUFNO0FBQUEsUUFDUjtBQUFBLFFBQ0E7QUFBQSxVQUNFLEtBQUssY0FBYyxRQUFRLHdCQUF3QixDQUFDO0FBQUEsVUFDcEQsTUFBTTtBQUFBLFFBQ1I7QUFBQSxNQUNGO0FBQUE7QUFBQSxNQUVBLE9BQU87QUFBQSxRQUNMLG9CQUFvQjtBQUFBLE1BQ3RCO0FBQUEsSUFDRixDQUFDO0FBQUEsRUFDSDtBQUFBLEVBRUEsUUFBUTtBQUFBLElBQ04sZUFBZSxRQUFRO0FBQUEsRUFDekI7QUFBQTtBQUFBLEVBR0EsU0FBUztBQUFBLElBQ1AsT0FBTztBQUFBO0FBQUEsTUFFTDtBQUFBLFFBQ0UsTUFBTTtBQUFBLFFBQ04sYUFBYSxRQUFRLGdCQUFnQjtBQUFBLE1BQ3ZDO0FBQUEsSUFDRjtBQUFBLEVBQ0Y7QUFBQTtBQUFBLEVBR0EsUUFBUTtBQUFBLElBQ04sU0FBUztBQUFBLE1BQ1Asa0JBQWtCO0FBQUEsUUFDaEIsTUFBTTtBQUFBLE1BQ1IsQ0FBQztBQUFBLElBQ0g7QUFBQSxFQUNGO0FBQ0YsQ0FBQzs7O0FEdEZELElBQU8sd0JBQVE7QUFBQSxFQUNiO0FBQUEsRUFDQUMsY0FBYTtBQUFBLElBQ1gsTUFBTTtBQUFBLE1BQ0osU0FBUztBQUFBLE1BQ1QsT0FBTztBQUFBLFFBQ0wsS0FBSztBQUFBLE1BQ1A7QUFBQSxNQUNBLGFBQWE7QUFBQSxNQUNiLFNBQVMsQ0FBQyxzREFBc0Q7QUFBQSxJQUNsRTtBQUFBLEVBQ0YsQ0FBQztBQUNIOyIsCiAgIm5hbWVzIjogWyJkZWZpbmVDb25maWciLCAiZGVmaW5lQ29uZmlnIl0KfQo=
