import { cmpGE } from '@genshin-optimizer/pando/engine'
import type { RelicSetKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForRelic, registerRelic } from '../util'

const key: RelicSetKey = 'HeroOfTriumphantSong'
const data_gen = allStats.relic[key]
const dm = mappedStats.relic[key]

const relicCount = own.common.count.sheet(key)

const { followUpUsed } = allBoolConditionals(key)

const sheet = registerRelic(
  key,
  // Handles passive buffs
  entriesForRelic(key, data_gen),

  // Conditional buffs
  registerBuff(
    'set4_ult_dmg_',
    ownBuff.premod.dmg_.addWithDmgType(
      'ult',
      cmpGE(relicCount, 4, followUpUsed.ifOn(dm[4].ult_dmg_)),
    ),
    cmpGE(relicCount, 4, 'infer', ''),
  ),
)
export default sheet
