import executor from './executor'
import type { GenLocaleExecutorSchema } from './schema'

const options: GenLocaleExecutorSchema = {}

describe('GenLocale Executor', () => {
  it('can run', async () => {
    const output = await executor(options)
    expect(output.success).toBe(true)
  })
})
