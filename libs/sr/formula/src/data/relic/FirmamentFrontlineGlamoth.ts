import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '@genshin-optimizer/sr/stats'
import { own, ownBuff, register } from '../util'
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

const relicCount = own.common.count.sheet(key)

const sheet = register(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  // Variable buffs
  ownBuff.premod.dmg_.add(
    cmpGE(
      relicCount,
      4,
      cmpGE(
        own.final.spd,
        dm[2].spdCutoff2,
        dm[2].dmg2_,
        cmpGE(own.final.spd, dm[2].spdCutoff1, dm[2].dmg1_)
      )
    )
  )
)
export default sheet
