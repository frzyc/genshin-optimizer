import type { SyncRepoExecutorSchema } from './schema'
import { workspaceRoot } from '@nx/devkit'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

export default async function runExecutor(
  options: SyncRepoExecutorSchema
): Promise<{ success: boolean }> {
  const cwd = path.join(workspaceRoot, options.localPath)
  const url = options.repoUrl
  const name = path.basename(cwd)

  if (fs.existsSync(cwd)) {
    // Fetch & reset
    const remoteHash =
      execSync(`git ls-remote -q ${url} HEAD`).toString().split('\t')[0] + '\n'
    const localHash = execSync(`git rev-parse -q HEAD`, { cwd }).toString()
    if (remoteHash !== localHash) {
      console.log('Local and remote hashes differ, fetching')
      execSync(`git fetch -q --depth 1`, { cwd })
      execSync(`git reset -q --hard origin/master`, { cwd })
    }
  } else {
    // Clone
    const parent = path.dirname(cwd)
    fs.mkdirSync(parent, { recursive: true })
    execSync(`git clone ${url} -q --depth 1 ${name}`, { cwd: parent })
  }

  // Compute hash
  const hash = execSync(`git rev-parse -q HEAD`, { cwd })
  console.log(`Synced ${name} with hash ${hash}`)

  const hashPath = path.format({ ...path.parse(cwd), base: '', ext: '.hash' })
  fs.writeFileSync(hashPath, hash)
  return { success: true }
}
