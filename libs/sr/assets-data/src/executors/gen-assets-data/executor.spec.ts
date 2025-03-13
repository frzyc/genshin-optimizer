import type { ExecutorContext } from '@nx/devkit'

import executor from './executor'
import type { GenAssetsDataExecutorSchema } from './schema'

const options: GenAssetsDataExecutorSchema = {}
const context: ExecutorContext = {
  root: '',
  cwd: process.cwd(),
  isVerbose: false,
  projectGraph: {
    nodes: {},
    dependencies: {},
  },
  projectsConfigurations: {
    projects: {},
    version: 2,
  },
  nxJsonConfiguration: {},
}

describe('Echo Executor', () => {
  it('can run', async () => {
    const output = await executor(options, context)
    expect(output.success).toBe(true)
  })
})
