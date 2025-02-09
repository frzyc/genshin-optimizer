import {
  allCharacterKeys,
  allLightConeKeys,
  allRelicSetKeys,
} from '@genshin-optimizer/sr/consts'
import type { Tree } from '@nx/devkit'
import { workspaceRoot } from '@nx/devkit'
import { writeFileSync } from 'fs'
import * as prettier from 'prettier'

export default async function genIndex(tree: Tree, sheet_type: string) {
  const file_location = `${workspaceRoot}/libs/sr/formula-ui/src/${sheet_type}/sheets/index.ts`
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
  const prettierRc = await prettier.resolveConfig(path)
  const index = prettier.format(
    `
import type { UISheet } from '@genshin-optimizer/gameOpt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
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
  `,
    { ...prettierRc, parser: 'typescript' }
  )
  writeFileSync(path, index)
}

async function writeRelicIndex(path: string) {
  const prettierRc = await prettier.resolveConfig(path)
  const index = prettier.format(
    `
import type { UISheet } from '@genshin-optimizer/gameOpt/sheet-ui'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
${allRelicSetKeys
  .map((setKey) => `import ${setKey} from './${setKey}'`)
  .join('\n')}

export const relicUiSheets: Record<RelicSetKey, UISheet<'2' | '4'>> = {
  ${allRelicSetKeys.join('\n,  ')}
}
  `,
    { ...prettierRc, parser: 'typescript' }
  )
  writeFileSync(path, index)
}

async function writeLightConeIndex(path: string) {
  const prettierRc = await prettier.resolveConfig(path)
  const index = prettier.format(
    `
import type { UISheetElement } from '@genshin-optimizer/gameOpt/sheet-ui'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'

${allLightConeKeys
  .map((lightConeKey) => `import ${lightConeKey} from './${lightConeKey}'`)
  .join('\n')}

export const lightConeUiSheets: Record<LightConeKey, UISheetElement> =
  {
    ${allLightConeKeys.join(',\n  ')}
  }
  `,
    { ...prettierRc, parser: 'typescript' }
  )
  writeFileSync(path, index)
}
