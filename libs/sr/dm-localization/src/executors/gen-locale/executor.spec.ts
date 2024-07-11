import type { ExecutorContext } from '@nx/devkit'

import executor from './executor'
import type { GenLocaleExecutorSchema } from './schema'

const options: GenLocaleExecutorSchema = {}
const context: ExecutorContext = {
  root: '',
  cwd: process.cwd(),
  isVerbose: false,
}

describe('GenLocale Executor', () => {
  it('can run', async () => {
    const output = await executor(options, context)
    expect(output.success).toBe(true)
  })
})
