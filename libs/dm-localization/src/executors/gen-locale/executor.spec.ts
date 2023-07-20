import executor from './executor'

describe.skip('GenLocale Executor', () => {
  it('can run', async () => {
    const output = await executor({})
    expect(output.success).toBe(true)
  })
})
