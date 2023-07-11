import { SyncRepoExecutorSchema } from './schema'
import { workspaceRoot } from '@nx/devkit'
import { execSync, exec } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

export default async function runExecutor(
  options: SyncRepoExecutorSchema
): Promise<{ success: boolean }> {
  const cwd = path.join(workspaceRoot, options.localPath)
  const name = path.basename(cwd)

  // Fetch existing or clone a new repo
  if (fs.existsSync(cwd)) execSync('git fetch -q --depth 1', { cwd })
  else {
    const parent = path.dirname(cwd)
    const url = options.repoUrl
    fs.mkdirSync(parent, { recursive: true })
    execSync(`git clone -q ${url} --depth 1 ${name}`, { cwd: parent })
  }

  // Reset and print hash for caching
  execSync(`git reset -q --hard origin/master`, { cwd })
  const hash = execSync(`git rev-parse -q HEAD`, { cwd })
  console.log(`Synced ${name} with hash ${hash}`)

  return { success: true }
}
