import { writeFileSync } from 'fs'
import { formatText } from '@genshin-optimizer/common/pipeline'
import {
  allCharacterKeys,
  allDiscSetKeys,
  allWengineKeys,
} from '@genshin-optimizer/zzz/consts'
import type { Tree } from '@nx/devkit'
import { workspaceRoot } from '@nx/devkit'
import { commonSheets } from '../../data/util'

export default async function genIndex(_tree: Tree, sheet_type: string) {
  const file_location = `${workspaceRoot}/libs/zzz/formula/src/data/${sheet_type}/index.ts`
  const meta_file_location = `${workspaceRoot}/libs/zzz/formula/src/meta/${sheet_type}/index.ts`
  switch (sheet_type) {
    case 'char':
      await writeCharIndex(file_location)
      await writeCharMetaIndex(meta_file_location)
      break
    case 'disc':
      await writeDiscIndex(file_location)
      await writeDiscMetaIndex(meta_file_location)
      break
    case 'wengine':
      await writeWengineIndex(file_location)
      await writeWengineMetaIndex(meta_file_location)
      break
    case 'common':
      await writeCommonMetaIndex(meta_file_location)
      break
  }
}

async function writeCharIndex(path: string) {
  const index = `
// WARNING: Generated file, do not modify
import { type TagMapNodeEntries } from '../util'
${allCharacterKeys
  .map((charKey) => `import ${charKey} from './sheets/${charKey}'`)
  .join('\n')}

const data: TagMapNodeEntries[] = [
  ${allCharacterKeys.join('\n,  ')}
]
export default data.flat()
  `
  const formatted = await formatText(path, index)
  writeFileSync(path, formatted)
}

async function writeCharMetaIndex(path: string) {
  const index = `
// WARNING: Generated file, do not modify
${allCharacterKeys.map((charKey) => `export * as ${charKey} from './${charKey}'`).join('\n')}
`

  const formatted = await formatText('index.ts', index)
  writeFileSync(path, formatted)
}

async function writeDiscIndex(path: string) {
  const index = `
// WARNING: Generated file, do not modify
import type { TagMapNodeEntries } from '../util'
${allDiscSetKeys
  .map((setKey) => `import ${setKey} from './sheets/${setKey}'`)
  .join('\n')}

const data: TagMapNodeEntries[] = [
  ${allDiscSetKeys.join('\n,  ')}
]
export default data.flat()

  `
  const formatted = await formatText(path, index)
  writeFileSync(path, formatted)
}

async function writeDiscMetaIndex(path: string) {
  const index = `
// WARNING: Generated file, do not modify
${allDiscSetKeys.map((setKey) => `export * as ${setKey} from './${setKey}'`).join('\n')}
`

  const formatted = await formatText('index.ts', index)
  writeFileSync(path, formatted)
}

async function writeWengineIndex(path: string) {
  const index = `
// WARNING: Generated file, do not modify
import type { TagMapNodeEntries } from '../util'
${allWengineKeys
  .map((wKey) => `import ${wKey} from './sheets/${wKey}'`)
  .join('\n')}

const data: TagMapNodeEntries[] = [
  ${allWengineKeys.join(',\n  ')}
]

export default data.flat()

  `
  const formatted = await formatText(path, index)
  writeFileSync(path, formatted)
}

async function writeWengineMetaIndex(path: string) {
  const index = `
// WARNING: Generated file, do not modify
${allWengineKeys.map((wKey) => `export * as ${wKey} from './${wKey}'`).join('\n')}
`

  const formatted = await formatText('index.ts', index)
  writeFileSync(path, formatted)
}

async function writeCommonMetaIndex(path: string) {
  const index = `
// WARNING: Generated file, do not modify
${commonSheets.map((sheet) => `export * as ${sheet}Meta from './${sheet}'`).join('\n')}
`
  const formatted = await formatText('index.ts', index)
  writeFileSync(path, formatted)
}
