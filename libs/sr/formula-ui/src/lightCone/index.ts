import type { UISheetElement } from '@genshin-optimizer/pando/ui-sheet'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import PastSelfInMirror from './sheets/PastSelfInMirror'

export const lightConeUiSheets: Partial<Record<LightConeKey, UISheetElement>> =
  {
    PastSelfInMirror,
  }
