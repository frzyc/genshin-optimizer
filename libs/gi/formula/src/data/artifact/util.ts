import { registerEquipment } from '@genshin-optimizer/game-opt/formula'
import type { ArtifactSetKey } from '@genshin-optimizer/gi/consts'
import { type NumNode } from '@genshin-optimizer/pando/engine'
import type { Tag, TagMapNodeEntries, TagMapNodeEntry } from '../util'
import { own } from '../util'

export function registerArt(
  sheet: ArtifactSetKey,
  ...data: (TagMapNodeEntry | TagMapNodeEntries)[]
): TagMapNodeEntries {
  return registerEquipment<Tag>(sheet, 'art', ...data)
}

export function artCount(key: ArtifactSetKey): NumNode {
  return own.common.count.sheet(key)
}
