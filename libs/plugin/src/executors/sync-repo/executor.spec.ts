import executor, { getLocalRepoHash } from './executor'
import * as path from 'path'
import * as fs from 'fs'

describe('SyncRepo Executor', () => {
  it('can run', async () => {
    const repoUrl = 'https://github.com/chrislgarry/Apollo-11/'
    const outputPath = path.join(__dirname, 'TestDB')
    const hashPath = path.join(__dirname, 'TestDB.hash')

    if (fs.existsSync(outputPath))
      fs.rmSync(outputPath, { recursive: true, force: true })
    if (fs.existsSync(hashPath)) fs.unlinkSync(hashPath)

    const output1 = await executor({
      repoUrl,
      outputPath,
      prefixPath: false,
    })

    // Clone
    expect(output1.success).toBe(true)
    expect(fs.existsSync(outputPath)).toBe(true)
    expect(fs.existsSync(hashPath)).toBe(true)
    expect(getLocalRepoHash(outputPath)).toEqual(`${fs.readFileSync(hashPath)}`)

    // So much fun we try it again (Fetch)
    const output2 = await executor({
      repoUrl,
      outputPath,
      prefixPath: false,
    })
    expect(output2.success).toBe(true)
    expect(fs.existsSync(outputPath)).toBe(true)
    expect(fs.existsSync(hashPath)).toBe(true)
    expect(getLocalRepoHash(outputPath)).toEqual(`${fs.readFileSync(hashPath)}`)

    // Clean up after oneself
    fs.rmSync(outputPath, { recursive: true, force: true })
    fs.unlinkSync(hashPath)
  })
})
