import executor from './executor'
import type { GenStatsExecutorSchema } from './schema'

const options: GenStatsExecutorSchema = {}

describe('GenStats Executor', () => {
  it('can run', async () => {
    const output = await executor(options)
    expect(output.success).toBe(true)
  })
})
