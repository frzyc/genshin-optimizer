import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import type { RelicSetDatum } from '@genshin-optimizer/sr/stats'
import type { TagMapNodeEntries } from '../util'
import { getStatFromStatKey, self, selfBuff } from '../util'

export function entriesForRelic(
  key: RelicSetKey,
  dataGen: RelicSetDatum
): TagMapNodeEntries {
  const relicCount = self.common.count.src(key)
  return [
    // Passive stats
    ...dataGen.setEffects.flatMap(({ numRequired, passiveStats }) =>
      Object.entries(passiveStats).map(([statKey, value]) =>
        getStatFromStatKey(selfBuff.premod, statKey).add(
          cmpGE(relicCount, numRequired, value)
        )
      )
    ),
  ]
}
