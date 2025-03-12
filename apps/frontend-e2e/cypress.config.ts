import { nxE2EPreset } from '@nx/cypress/plugins/cypress-preset'
import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    ...nxE2EPreset(__filename, {
      cypressDir: 'src',
      bundler: 'vite',
      webServerCommands: {
        default: 'yarn nx run frontend:dev',
        production: 'yarn nx run frontend:preview',
      },
      ciWebServerCommand: 'yarn nx run frontend:preview',
      ciBaseUrl: 'http://localhost:4300',
    }),
    baseUrl: 'http://localhost:4200',
  },
})
