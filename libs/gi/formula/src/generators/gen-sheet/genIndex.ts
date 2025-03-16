import { execSync } from 'child_process'
import { writeFileSync } from 'fs'
import { join } from 'path'
import {
  allArtifactSetKeys,
  allCharacterKeys,
  allWeaponKeys,
} from '@genshin-optimizer/gi/consts'
import type { Tree } from '@nx/devkit'
import { workspaceRoot } from '@nx/devkit'

/**
 * Returns Biome formatter path. Assumes, that node_modules have been initialized
 */
function getBiomeExec() {
  return join(
    workspaceRoot,
    'node_modules',
    '@biomejs',
    'biome',
    'bin',
    'biome'
  )
}

export default async function genIndex(tree: Tree, sheet_type: string) {
  const file_location = `${workspaceRoot}/libs/gi/formula/src/data/${sheet_type}/index.ts`
  switch (sheet_type) {
    case 'char':
      await writeCharIndex(file_location)
      break
    case 'artifact':
      await writeArtifactIndex(file_location)
      break
    case 'weapon':
      await writeWeaponIndex(file_location)
      break
  }
}

async function writeCharIndex(path: string) {
  const biomePath = getBiomeExec()
  const index = `
import type { TagMapNodeEntries } from '../util'
${allCharacterKeys
  .map((charKey) => `import ${charKey} from './${charKey}'`)
  .join('\n')}

const data: TagMapNodeEntries[] = [
  ${allCharacterKeys.join('\n,  ')}
]
export default data.flat()

  `
  const formatted = execSync(
    `node ${biomePath} check --stdin-file-path=${path} --fix`,
    {
      input: index,
    }
  ).toString()
  writeFileSync(path, formatted)
}

async function writeArtifactIndex(path: string) {
  const biomePath = getBiomeExec()
  const index = `
import type { TagMapNodeEntries } from '../util'
${allArtifactSetKeys
  .map((setKey) => `import ${setKey} from './${setKey}'`)
  .join('\n')}

const data: TagMapNodeEntries[] = [
  ${allArtifactSetKeys.join('\n,  ')}
]
export default data.flat()

  `
  const formatted = execSync(
    `node ${biomePath} check --stdin-file-path=${path} --fix`,
    {
      input: index,
    }
  ).toString()
  writeFileSync(path, formatted)
}

async function writeWeaponIndex(path: string) {
  const biomePath = getBiomeExec()
  const index = `
import type { TagMapNodeEntries } from '../util'
${allWeaponKeys
  .map((weaponKey) => `import ${weaponKey} from './${weaponKey}'`)
  .join('\n')}

const data: TagMapNodeEntries[] = [
  ${allWeaponKeys.join(',\n  ')}
]

export default data.flat()

  `
  const formatted = execSync(
    `node ${biomePath} check --stdin-file-path=${path} --fix`,
    {
      input: index,
    }
  ).toString()
  writeFileSync(path, formatted)
}
