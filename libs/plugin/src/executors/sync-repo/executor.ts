import type { SyncRepoExecutorSchema } from './schema'
import { workspaceRoot } from '@nx/devkit'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

export default async function runExecutor(
  options: SyncRepoExecutorSchema
): Promise<{ success: boolean }> {
  const { localPath, repoUrl: url, prefixPath: prefix = true } = options
  const cwd = prefix ? path.join(workspaceRoot, localPath) : localPath
  const name = path.basename(cwd)

  if (fs.existsSync(cwd)) {
    // Fetch & reset
    const remoteHash = getRemoteRepoHash(url)
    const localHash = getLocalRepoHash(cwd)
    if (remoteHash !== localHash) {
      console.log('Local and remote hashes differ, fetching')
      execSync(`git fetch -q --depth 1`, { cwd })
      execSync(`git reset -q --hard origin/master`, { cwd })
    } else console.log('Repo already existed with the latest commit')
  } else {
    // Clone
    console.log(`Cloning ${name}`)
    const parent = path.dirname(cwd)
    fs.mkdirSync(parent, { recursive: true })
    execSync(`git clone ${url} -q --depth 1 ${name}`, { cwd: parent })
  }

  // Compute hash
  const hash = getLocalRepoHash(cwd)
  console.log(`Synced ${name} with hash ${hash}`)

  const hashPath = path.format({ ...path.parse(cwd), base: '', ext: '.hash' })
  fs.writeFileSync(hashPath, hash)
  return { success: true }
}

export const getLocalRepoHash = (cwd: string): string =>
  `${execSync(`git rev-parse -q HEAD`, { cwd })}`.trimEnd()
export const getRemoteRepoHash = (url: string): string =>
  `${execSync(`git ls-remote -q ${url} HEAD`)}`.replace(/\s+HEAD\s*$/, '')
