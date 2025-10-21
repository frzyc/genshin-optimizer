import { mkdirSync, writeFileSync } from 'fs'
import { dirname } from 'path'
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
  const main_meta_location = `${workspaceRoot}/libs/zzz/formula/src/meta/index.ts`
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
  await writeMainMetaIndex(main_meta_location)
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
  mkdirSync(dirname(path), { recursive: true })
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
  mkdirSync(dirname(path), { recursive: true })
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
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, formatted)
}

async function writeCommonMetaIndex(path: string) {
  const index = `
// WARNING: Generated file, do not modify
${commonSheets.map((sheet) => `export * as ${sheet}Meta from './${sheet}'`).join('\n')}
`
  const formatted = await formatText('index.ts', index)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, formatted)
}

async function writeMainMetaIndex(path: string) {
  const allKeys = [
    ...allCharacterKeys,
    ...allDiscSetKeys,
    ...allWengineKeys,
    ...commonSheets,
  ]

  const conditionalEntries = allKeys
    .map((key) => `  ${key}: ${key}.conditionals,`)
    .join('\n')
  const formulaEntries = allKeys
    .map((key) => `  ${key}: ${key}.formulas,`)
    .join('\n')
  const buffEntries = allKeys.map((key) => `  ${key}: ${key}.buffs,`).join('\n')

  const index = `
// WARNING: Generated file, do not modify
export * from './char'
export * from './common'
export * from './disc'
export * from './wengine'

import * as char from './char'
import * as common from './common'
import * as disc from './disc'
import * as wengine from './wengine'

const { ${allCharacterKeys.join(', ')} } = char
const { ${allDiscSetKeys.join(', ')} } = disc
const { ${allWengineKeys.join(', ')} } = wengine
const { ${commonSheets.map((sheet) => `${sheet}Meta: ${sheet}`).join(', ')} } = common

export const conditionals = {
${conditionalEntries}
} as any

export const formulas = {
${formulaEntries}
} as any

export const buffs = {
${buffEntries}
} as any
`
  const formatted = await formatText('index.ts', index)
  mkdirSync(dirname(path), { recursive: true })
  writeFileSync(path, formatted)
}
