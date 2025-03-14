import { registerEquipment } from '@genshin-optimizer/game-opt/formula'
import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import type { RelicSetDatum } from '@genshin-optimizer/sr/stats'
import type { Tag, TagMapNodeEntries, TagMapNodeEntry } from '../util'
import { getStatFromStatKey, own, ownBuff, registerBuff } from '../util'

export function registerRelic(
  sheet: RelicSetKey,
  ...data: (TagMapNodeEntry | TagMapNodeEntries)[]
): TagMapNodeEntries {
  return registerEquipment<Tag>(sheet, 'relic', ...data)
}

export function entriesForRelic(
  key: RelicSetKey,
  dataGen: RelicSetDatum,
): TagMapNodeEntries {
  const relicCount = own.common.count.sheet(key)
  return [
    // Passive stats
    ...dataGen.setEffects.flatMap(({ numRequired, passiveStats }) =>
      Object.entries(passiveStats).flatMap(([statKey, value]) =>
        registerBuff(
          `set${numRequired}_passive_${statKey}`,
          getStatFromStatKey(ownBuff.premod, statKey).add(
            cmpGE(relicCount, numRequired, value),
          ),
          cmpGE(relicCount, numRequired, 'unique', ''),
        ),
      ),
    ),
  ]
}
