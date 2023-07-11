import type { SyncRepoExecutorSchema } from './schema'
import { workspaceRoot } from '@nx/devkit'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

export default async function runExecutor(
  options: SyncRepoExecutorSchema
): Promise<{ success: boolean }> {
  const cwd = path.join(workspaceRoot, options.localPath)
  const name = path.basename(cwd)

  if (fs.existsSync(cwd))
    // Fetch & reset
    execSync('git fetch -q && git reset -q --hard origin/master', { cwd })
  else {
    // Clone
    const parent = path.dirname(cwd)
    const url = options.repoUrl
    fs.mkdirSync(parent, { recursive: true })
    execSync(`git clone -q ${url} --depth 1 ${name}`, { cwd: parent })
  }

  // Compute hash
  const hash = execSync(`git rev-parse -q HEAD`, { cwd })
  console.log(`Synced ${name} with hash ${hash}`)

  const hashPath = path.format({ ...path.parse(cwd), base: '', ext: '.hash' })
  fs.writeFileSync(hashPath, hash)
  return { success: true }
}
