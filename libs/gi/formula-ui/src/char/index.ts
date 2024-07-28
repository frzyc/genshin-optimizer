import type { CharacterKey } from '@genshin-optimizer/consts'
import type { UISheet } from '@genshin-optimizer/pando/ui-sheet'
import Nahida from './Nahida'
import type { TalentSheetElementKey } from './consts'
export const uiSheets: Partial<
  Record<CharacterKey, UISheet<TalentSheetElementKey>>
> = { Nahida } as const
