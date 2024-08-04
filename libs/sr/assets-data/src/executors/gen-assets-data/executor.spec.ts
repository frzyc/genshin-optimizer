import type { ExecutorContext } from '@nx/devkit'

import executor from './executor'
import type { GenAssetsDataExecutorSchema } from './schema'

const options: GenAssetsDataExecutorSchema = {}
const context: ExecutorContext = {
  root: '',
  cwd: process.cwd(),
  isVerbose: false,
}

describe('GenAssetsData Executor', () => {
  it('can run', async () => {
    const output = await executor(options, context)
    expect(output.success).toBe(true)
  })
})
