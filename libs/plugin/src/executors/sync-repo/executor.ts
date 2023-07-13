import type { SyncRepoExecutorSchema } from './schema'
import { workspaceRoot } from '@nx/devkit'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

export default async function runExecutor(
  options: SyncRepoExecutorSchema
): Promise<{ success: boolean }> {
  const { outputPath, repoUrl: url, prefixPath: prefix = true } = options
  const cwd = prefix ? path.join(workspaceRoot, outputPath) : outputPath
  const remoteHash = getRemoteRepoHash(url)
  const name = path.basename(cwd)

  console.log(
    `
Caution: if this is part of nx cache replay,
         no git command is actually executed.` + '\n '
  )

  if (fs.existsSync(cwd)) {
    // Fetch & reset
    const localHash = getLocalRepoHash(cwd)
    if (remoteHash !== localHash) {
      execSync(`git fetch --depth 1`, { cwd })
      execSync(`git reset --hard origin/master`, { cwd })
    } else console.log('Repo already existed with the latest commit')
  } else {
    // Clone
    const parent = path.dirname(cwd)
    fs.mkdirSync(parent, { recursive: true })
    execSync(`git clone ${url} --depth 1 ${name}`, { cwd: parent })
  }

  // Compute hash
  const localHash = getLocalRepoHash(cwd)
  console.log(`Synced ${name} with hash ${localHash}`)

  const hashPath = path.format({ ...path.parse(cwd), base: '', ext: '.hash' })
  fs.writeFileSync(hashPath, localHash)
  return { success: remoteHash === localHash }
}

export const getLocalRepoHash = (cwd: string): string =>
  `${execSync(`git rev-parse HEAD`, { cwd })}`.trimEnd()
export const getRemoteRepoHash = (url: string): string =>
  `${execSync(`git ls-remote ${url} HEAD`)}`.replace(/\s+HEAD\s*$/, '')
