import {
  allCharacterKeys,
  allDiscSetKeys,
  allWengineKeys,
} from '@genshin-optimizer/zzz/consts'
import type { Tree } from '@nx/devkit'
import { workspaceRoot } from '@nx/devkit'
import { writeFileSync } from 'fs'
import * as prettier from 'prettier'

export default async function genIndex(tree: Tree, sheet_type: string) {
  const file_location = `${workspaceRoot}/libs/zzz/formula/src/data/${sheet_type}/${sheet_type}.ts`
  switch (sheet_type) {
    case 'char':
      await writeCharIndex(file_location)
      break
    case 'disc':
      await writeDiscIndex(file_location)
      break
    case 'wengine':
      await writeWengineIndex(file_location)
      break
  }
}

async function writeCharIndex(path: string) {
  const prettierRc = await prettier.resolveConfig(path)
  const index = prettier.format(
    `
// WARNING: Generated file, do not modify
import type { TagMapNodeEntries } from '../util'
${allCharacterKeys
  .map((charKey) => `import ${charKey} from './sheets/${charKey}'`)
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

async function writeDiscIndex(path: string) {
  const prettierRc = await prettier.resolveConfig(path)
  const index = prettier.format(
    `
// WARNING: Generated file, do not modify
import type { TagMapNodeEntries } from '../util'
${allDiscSetKeys
  .map((setKey) => `import ${setKey} from './sheets/${setKey}'`)
  .join('\n')}

const data: TagMapNodeEntries[] = [
  ${allDiscSetKeys.join('\n,  ')}
]
export default data.flat()

  `,
    { ...prettierRc, parser: 'typescript' }
  )
  writeFileSync(path, index)
}

async function writeWengineIndex(path: string) {
  const prettierRc = await prettier.resolveConfig(path)
  const index = prettier.format(
    `
// WARNING: Generated file, do not modify
import type { TagMapNodeEntries } from '../util'
${allWengineKeys
  .map((wKey) => `import ${wKey} from './sheets/${wKey}'`)
  .join('\n')}

const data: TagMapNodeEntries[] = [
  ${allWengineKeys.join(',\n  ')}
]

export default data.flat()

  `,
    { ...prettierRc, parser: 'typescript' }
  )
  writeFileSync(path, index)
}
