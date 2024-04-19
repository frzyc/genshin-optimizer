import type { UISheet } from '@genshin-optimizer/pando/ui-sheet'
import type { CharacterKey } from '@genshin-optimizer/sr/consts'
import Serval from './Serval'

// TODO: Remove Partial
export const uiSheets: Partial<Record<CharacterKey, UISheet>> = {
  Serval,
}
