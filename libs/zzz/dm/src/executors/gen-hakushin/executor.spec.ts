import type { ExecutorContext } from '@nx/devkit'

import executor from './executor'
import type { GenHakushinDataExecutorSchema } from './schema'

const options: GenHakushinDataExecutorSchema = {}
const context: ExecutorContext = {
  root: '',
  cwd: process.cwd(),
  isVerbose: false,
}

describe('GenHakushinData Executor', () => {
  it('can run', async () => {
    const output = await executor(options, context)
    expect(output.success).toBe(true)
  })
})
