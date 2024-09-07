import type { UISheet } from '@genshin-optimizer/pando/ui-sheet'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import type { TalentSheetElementKey } from '../consts'
import Arlan from './Arlan'
import RuanMei from './RuanMei'
export const uiSheets: Partial<
  Record<CharacterKey, UISheet<TalentSheetElementKey>>
> = { Arlan, RuanMei } as const
