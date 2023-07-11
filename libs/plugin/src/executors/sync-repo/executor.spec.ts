import type { SyncRepoExecutorSchema } from './schema'
import executor from './executor'

const options: SyncRepoExecutorSchema = {
  repoUrl: '',
  localPath: '',
}

describe.skip('SyncRepo Executor', () => {
  it('can run', async () => {
    const output = await executor(options)
    expect(output.success).toBe(true)
  })
})
