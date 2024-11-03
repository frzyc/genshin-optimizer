import type { UISheet } from '@genshin-optimizer/pando/ui-sheet'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import WatchmakerMasterOfDreamMachinations from './cavern/WatchmakerMasterOfDreamMachinations'

export const relicUiSheets: Partial<Record<RelicSetKey, UISheet<'2' | '4'>>> = {
  WatchmakerMasterOfDreamMachinations,
}
