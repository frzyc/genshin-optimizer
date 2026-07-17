import {
  type CreateNodesContextV2,
  type CreateNodesV2,
  createNodesFromFiles,
} from '@nx/devkit'
import { dirname } from 'path'

export type MyPluginOptions = {
}

export const createNodesV2: CreateNodesV2<MyPluginOptions> = [
  // look for all package.json files in the workspace
  // (keep this as project.json if you're not using npm workspaces)
  '**/package.json',
  async (configFiles, options, context) => {
    return await createNodesFromFiles(
      (configFile, options, context) =>
        createNodesInternal(configFile, options, context),
      configFiles,
      options,
      context
    )
  },
]

async function createNodesInternal(
  configFilePath: string,
  options: MyPluginOptions | undefined,
  context: CreateNodesContextV2
) {
  const root = dirname(configFilePath)

  // Project configuration to be merged into the rest of the Nx configuration
  return {
    projects: {
      [root]: {
        targets: {
          'lint': {
            // Nx target syntax to execute a command. More on {projectRoot} below
            command:
              `yarn biome lint --diagnostic-level=warn {projectRoot}`,
            cache: true,
            inputs: [
              'default',
              '^default',
              '{workspaceRoot}/biome.json',
              {
                externalDependencies: ['@biomejs/biome'],
              },
            ],
          },
          'format': {
            // Nx target syntax to execute a command. More on {projectRoot} below
            command: `yarn biome format {projectRoot}`,
            cache: true,
            inputs: [
              'default',
              '^default',
              '{workspaceRoot}/biome.json',
              {
                externalDependencies: ['@biomejs/biome'],
              },
            ],
          },
        },
      },
    },
  }
}
