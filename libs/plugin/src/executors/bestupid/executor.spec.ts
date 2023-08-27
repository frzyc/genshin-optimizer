import type { BestupidExecutorSchema } from './schema'
import executor from './executor'

const options: BestupidExecutorSchema = {}

describe('Bestupid Executor', () => {
  it('can run', async () => {
    const output = await executor(options)
    expect(output.success).toBe(true)
  })
})
