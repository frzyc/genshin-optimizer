import { writeFileSync } from 'fs'
import {
  allCharacterKeys,
  allDiscSetKeys,
  allWengineKeys,
} from '@genshin-optimizer/zzz/consts'
import type { Tree } from '@nx/devkit'
import { workspaceRoot } from '@nx/devkit'
import * as prettier from 'prettier'

export default async function genIndex(tree: Tree, map_type: string) {
  const file_location = `${workspaceRoot}/libs/zzz/stats/src/mappedStats/${map_type}/index.ts`
  switch (map_type) {
    case 'char':
      await writeIndex(file_location, allCharacterKeys)
      break
    case 'disc':
      await writeIndex(file_location, allDiscSetKeys)
      break
    case 'wengine':
      await writeIndex(file_location, allWengineKeys)
      break
  }
}

async function writeIndex(path: string, keys: readonly string[]) {
  const prettierRc = await prettier.resolveConfig(path)
  const index = prettier.format(
    `// WARNING: Generated file, do not modify
${keys.map((key) => `import ${key} from './maps/${key}'`).join('\n')}

const maps = {
  ${keys.join('\n,  ')}
}
export default maps

  `,
    { ...prettierRc, parser: 'typescript' }
  )
  writeFileSync(path, index)
}
