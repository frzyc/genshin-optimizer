import executor, { getLocalRepoHash } from './executor'
import * as path from 'path'
import * as fs from 'fs'

describe('SyncRepo Executor', () => {
  it('can run', async () => {
    const repoUrl = 'https://github.com/chrislgarry/Apollo-11/'
    const localPath = path.join(__dirname, 'TestDB')
    const hashPath = path.join(__dirname, 'TestDB.hash')

    if (fs.existsSync(localPath))
      fs.rmSync(localPath, { recursive: true, force: true })
    if (fs.existsSync(hashPath)) fs.unlinkSync(hashPath)

    const output1 = await executor({
      repoUrl,
      localPath,
      prefixPath: false,
    })

    // Clone
    expect(output1.success).toBe(true)
    expect(fs.existsSync(localPath)).toBe(true)
    expect(fs.existsSync(hashPath)).toBe(true)
    expect(getLocalRepoHash(localPath)).toEqual(`${fs.readFileSync(hashPath)}`)

    // So much fun we try it again (Fetch)
    const output2 = await executor({
      repoUrl,
      localPath,
      prefixPath: false,
    })
    expect(output2.success).toBe(true)
    expect(fs.existsSync(localPath)).toBe(true)
    expect(fs.existsSync(hashPath)).toBe(true)
    expect(getLocalRepoHash(localPath)).toEqual(`${fs.readFileSync(hashPath)}`)

    // Clean up after oneself
    fs.rmSync(localPath, { recursive: true, force: true })
    fs.unlinkSync(hashPath)
  })
})
