import type { GenAssetsExecutorSchema } from './schema'
import executor from './executor'

const options: GenAssetsExecutorSchema = {}

describe('GenAssets Executor', () => {
  it('can run', async () => {
    const output = await executor(options)
    expect(output.success).toBe(true)
  })
})
