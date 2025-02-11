import type { UISheet } from '@genshin-optimizer/game-opt/sheet-ui'
import type { CharacterKey } from '@genshin-optimizer/gi/consts'
import type { TalentSheetElementKey } from '../consts'
import Nahida from './Nahida'
export const uiSheets: Partial<
  Record<CharacterKey, UISheet<TalentSheetElementKey>>
> = { Nahida } as const
