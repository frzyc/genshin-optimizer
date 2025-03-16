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

export default async function genIndex(tree: Tree, map_type: string) {
  const file_location = `${workspaceRoot}/libs/sr/stats/src/mappedStats/${map_type}/index.ts`
  switch (map_type) {
    case 'char':
      await writeIndex(file_location, allCharacterKeys)
      break
    case 'relic':
      await writeIndex(file_location, allRelicSetKeys)
      break
    case 'lightCone':
      await writeIndex(file_location, allLightConeKeys)
      break
  }
}

async function writeIndex(path: string, keys: readonly string[]) {
  const biomePath = getBiomeExec()
  const index = `
${keys.map((key) => `import ${key} from './maps/${key}'`).join('\n')}

const maps = {
  ${keys.join('\n,  ')}
}
export default maps

  `
  const formatted = execSync(
    `node ${biomePath} check --stdin-file-path=${path} --fix`,
    {
      input: index,
    }
  ).toString()
  writeFileSync(path, formatted)
}
