import { execSync } from 'child_process'
import { writeFileSync } from 'fs'
import * as path from 'path'
import {
  allCharacterKeys,
  allLightConeKeys,
  allRelicSetKeys,
} from '@genshin-optimizer/sr/consts'
import type { Tree } from '@nx/devkit'
import { workspaceRoot } from '@nx/devkit'

/**
 * Returns Biome formatter path. Assumes, that node_modules have been initialized
 */
function getBiomeExec() {
  return path.join(
    workspaceRoot,
    'node_modules',
    '@biomejs',
    'biome',
    'bin',
    'biome'
  )
}

export default async function genIndex(tree: Tree, sheet_type: string) {
  const file_location = `${workspaceRoot}/libs/sr/formula/src/data/${sheet_type}/index.ts`
  switch (sheet_type) {
    case 'char':
      await writeCharIndex(file_location)
      break
    case 'relic':
      await writeRelicIndex(file_location)
      break
    case 'lightCone':
      await writeLightConeIndex(file_location)
      break
  }
}

async function writeCharIndex(path: string) {
  const biomePath = getBiomeExec()
  const index = `
import type { TagMapNodeEntries } from '../util'
${allCharacterKeys
  .map((charKey) => `import ${charKey} from './sheets/${charKey}'`)
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

async function writeRelicIndex(path: string) {
  const biomePath = getBiomeExec()
  const index = `
import type { TagMapNodeEntries } from '../util'
${allRelicSetKeys
  .map((setKey) => `import ${setKey} from './sheets/${setKey}'`)
  .join('\n')}

const data: TagMapNodeEntries[] = [
  ${allRelicSetKeys.join('\n,  ')}
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

async function writeLightConeIndex(path: string) {
  const biomePath = getBiomeExec()
  const index = `
import type { TagMapNodeEntries } from '../util'
${allLightConeKeys
  .map(
    (lightConeKey) => `import ${lightConeKey} from './sheets/${lightConeKey}'`
  )
  .join('\n')}

const data: TagMapNodeEntries[] = [
  ${allLightConeKeys.join(',\n  ')}
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
