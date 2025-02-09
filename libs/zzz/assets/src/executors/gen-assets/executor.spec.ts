import executor from './executor'

describe.skip('GenAssets Executor', () => {
  it('can run', async () => {
    const output = await executor({})
    expect(output.success).toBe(true)
  })
})
