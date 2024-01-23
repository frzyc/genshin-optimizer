import { cmpGE } from '@genshin-optimizer/pando'
import type { RelicSetKey } from '@genshin-optimizer/sr-consts'
import { allStats } from '@genshin-optimizer/sr-stats'
import { register, self, selfBuff } from '../util'
import { entriesForRelic } from './util'

const key: RelicSetKey = 'FirmamentFrontlineGlamoth'
const data_gen = allStats.relic[key]

let t = 0
const dm = {
  2: {
    passiveAtk: data_gen.setEffects[0].otherStats[t++],
    spdCutoff1: data_gen.setEffects[0].otherStats[t++],
    spdCutoff2: data_gen.setEffects[0].otherStats[t++],
    dmg1_: data_gen.setEffects[0].otherStats[t++],
    dmg2_: data_gen.setEffects[0].otherStats[t++],
  },
}

const relicCount = self.common.count.src(key)

const sheet = register(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  // Variable buffs
  selfBuff.premod.dmg_.add(
    cmpGE(
      relicCount,
      4,
      cmpGE(
        self.final.spd,
        dm[2].spdCutoff2,
        dm[2].dmg2_,
        cmpGE(self.final.spd, dm[2].spdCutoff1, dm[2].dmg1_)
      )
    )
  )
)
export default sheet
