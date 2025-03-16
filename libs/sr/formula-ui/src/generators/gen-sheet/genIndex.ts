import { writeFileSync } from 'fs'
import { formatText } from '@genshin-optimizer/common/pipeline'
import {
  allCharacterKeys,
  allLightConeKeys,
  allRelicSetKeys,
} from '@genshin-optimizer/sr/consts'
import type { Tree } from '@nx/devkit'
import { workspaceRoot } from '@nx/devkit'

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
  const index = `
import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
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
  `
  const formatted = await formatText(path, index)
  writeFileSync(path, formatted)
}

async function writeRelicIndex(path: string) {
  const index = `
import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
${allRelicSetKeys
  .map((setKey) => `import ${setKey} from './${setKey}'`)
  .join('\n')}

export const relicUiSheets: Record<RelicSetKey, UISheet<'2' | '4'>> = {
  ${allRelicSetKeys.join('\n,  ')}
}
  `
  const formatted = await formatText(path, index)
  writeFileSync(path, formatted)
}

async function writeLightConeIndex(path: string) {
  const index = `
import type { UISheetElement } from '@genshin-optimizer/game-opt/sheet-ui'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'

${allLightConeKeys
  .map((lightConeKey) => `import ${lightConeKey} from './${lightConeKey}'`)
  .join('\n')}

export const lightConeUiSheets: Record<LightConeKey, UISheetElement> =
  {
    ${allLightConeKeys.join(',\n  ')}
  }
  `
  const formatted = await formatText(path, index)
  writeFileSync(path, formatted)
}
