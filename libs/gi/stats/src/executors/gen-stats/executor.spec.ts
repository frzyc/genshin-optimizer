import type { GenStatsExecutorSchema } from './schema'
import executor from './executor'

const options: GenStatsExecutorSchema = {}

describe.skip('GenStats Executor', () => {
  it('can run', async () => {
    const output = await executor(options)
    expect(output.success).toBe(true)
  })
})
