import type { Tree } from '@nx/devkit'
import { workspaceRoot } from '@nx/devkit'
import { writeFileSync } from 'fs'
import * as prettier from 'prettier'
import {
  allArtifactSetKeys,
  allCharacterKeys,
  allWeaponKeys,
} from '@genshin-optimizer/consts'

export default async function genIndex(tree: Tree, sheet_type: string) {
  const file_location = `${workspaceRoot}/libs/gi-formula/src/data/${sheet_type}/index.ts`
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
  const prettierRc = await prettier.resolveConfig(path)
  const index = prettier.format(
    `
import type { TagMapNodeEntries } from '../util'
${allCharacterKeys
  .map((charKey) => `import ${charKey} from './${charKey}'`)
  .join('\n')}

const data: TagMapNodeEntries[] = [
  ${allCharacterKeys.join('\n,  ')}
]
export default data.flat()

  `,
    { ...prettierRc, parser: 'typescript' }
  )
  writeFileSync(path, index)
}

async function writeArtifactIndex(path: string) {
  const prettierRc = await prettier.resolveConfig(path)
  const index = prettier.format(
    `
import type { TagMapNodeEntries } from '../util'
${allArtifactSetKeys
  .map((setKey) => `import ${setKey} from './${setKey}'`)
  .join('\n')}

const data: TagMapNodeEntries[] = [
  ${allArtifactSetKeys.join('\n,  ')}
]
export default data.flat()

  `,
    { ...prettierRc, parser: 'typescript' }
  )
  writeFileSync(path, index)
}

async function writeWeaponIndex(path: string) {
  const prettierRc = await prettier.resolveConfig(path)
  const index = prettier.format(
    `
import type { TagMapNodeEntries } from '../util'
${allWeaponKeys
  .map((weaponKey) => `import ${weaponKey} from './${weaponKey}'`)
  .join('\n')}

const data: TagMapNodeEntries[] = [
  ${allWeaponKeys.join(',\n  ')}
]

export default data.flat()

  `,
    { ...prettierRc, parser: 'typescript' }
  )
  writeFileSync(path, index)
}
