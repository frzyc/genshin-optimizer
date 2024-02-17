import type { SyncRepoExecutorSchema } from './schema'
import { workspaceRoot } from '@nx/devkit'
import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'

export default async function runExecutor(
  options: SyncRepoExecutorSchema
): Promise<{ success: boolean }> {
  const { outputPath, prefixPath: prefix = true } = options
  const cwd = prefix ? path.join(workspaceRoot, outputPath) : outputPath
  const remoteHash = getRemoteRepoHash(cwd)
  const name = path.basename(cwd)

  console.log(
    `
Caution: if this is part of nx cache replay,
         no git command is actually executed.` + '\n '
  )

  {
    // Fetch & reset
    const localHash = getLocalRepoHash(cwd)
    if (remoteHash !== localHash) {
      execSync(`git submodule update --init ${cwd}`)
    } else console.log('Repo already existed with the latest commit')
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
export const getRemoteRepoHash = (cwd: string): string =>
  `${execSync(`git ls-tree --object-only HEAD ${cwd}`)}`.trimEnd()
