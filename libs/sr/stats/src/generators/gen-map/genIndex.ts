import {
  allCharacterKeys,
  allLightConeKeys,
  allRelicSetKeys,
} from '@genshin-optimizer/sr/consts'
import type { Tree } from '@nx/devkit'
import { workspaceRoot } from '@nx/devkit'
import { writeFileSync } from 'fs'
import * as prettier from 'prettier'

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
  const prettierRc = await prettier.resolveConfig(path)
  const index = await prettier.format(
    `
${keys.map((key) => `import ${key} from './maps/${key}'`).join('\n')}

const maps = {
  ${keys.join('\n,  ')}
}
export default maps

  `,
    { ...prettierRc, parser: 'typescript' },
  )
  writeFileSync(path, index)
}
