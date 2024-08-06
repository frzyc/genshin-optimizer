import executor from './executor'
import type { GenMatsExecutorSchema } from './schema'

const options: GenMatsExecutorSchema = {}

describe.skip('GenMats Executor', () => {
  it('can run', async () => {
    const output = await executor(options)
    expect(output.success).toBe(true)
  })
})
