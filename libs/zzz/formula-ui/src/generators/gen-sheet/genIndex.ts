import { execSync } from 'child_process'
import { writeFileSync } from 'fs'
import * as path from 'path'
import {
  allCharacterKeys,
  allDiscSetKeys,
  allWengineKeys,
} from '@genshin-optimizer/zzz/consts'
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
  const file_location = `${workspaceRoot}/libs/zzz/formula-ui/src/${sheet_type}/sheets/index.ts`
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
  const biomePath = getBiomeExec()
  const index = `
// WARNING: Generated file, do not modify
import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/zzz/consts'
import type { TalentSheetElementKey } from '../consts'
${allCharacterKeys
  .map((charKey) => `import ${charKey} from './${charKey}'`)
  .join('\n')}

export const uiSheets: Record<
  CharacterKey,
  UISheet<TalentSheetElementKey>
> = {
  ${allCharacterKeys.join('\n,  ')}
} as const
  `
  const formatted = execSync(
    `node ${biomePath} check --stdin-file-path=${path} --fix`,
    {
      input: index,
    }
  ).toString()
  writeFileSync(path, formatted)
}

async function writeDiscIndex(path: string) {
  const biomePath = getBiomeExec()
  const index = `
// WARNING: Generated file, do not modify
import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { DiscSetKey } from '@genshin-optimizer/zzz/consts'
${allDiscSetKeys
  .map((setKey) => `import ${setKey} from './${setKey}'`)
  .join('\n')}

export const discUiSheets: Record<DiscSetKey, UISheet<'2' | '4'>> = {
  ${allDiscSetKeys.join('\n,  ')}
}
  `
  const formatted = execSync(
    `node ${biomePath} check --stdin-file-path=${path} --fix`,
    {
      input: index,
    }
  ).toString()
  writeFileSync(path, formatted)
}

async function writeWengineIndex(path: string) {
  const biomePath = getBiomeExec()
  const index = `
// WARNING: Generated file, do not modify
import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import type { WengineKey } from '@genshin-optimizer/zzz/consts'

${allWengineKeys.map((wkey) => `import ${wkey} from './${wkey}'`).join('\n')}

export const wengineUiSheets: Record<WengineKey, UISheetElement> =
  {
    ${allWengineKeys.join(',\n  ')}
  }
  `
  const formatted = execSync(
    `node ${biomePath} check --stdin-file-path=${path} --fix`,
    {
      input: index,
    }
  ).toString()
  writeFileSync(path, formatted)
}
