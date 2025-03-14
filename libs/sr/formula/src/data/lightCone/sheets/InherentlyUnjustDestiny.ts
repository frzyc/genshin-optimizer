import { cmpGE, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import {
  allBoolConditionals,
  own,
  ownBuff,
  registerBuff,
  teamBuff,
} from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'InherentlyUnjustDestiny'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { shieldProvided, followUpHit } = allBoolConditionals(key)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  // Conditional buffs
  registerBuff(
    'crit_dmg_',
    ownBuff.premod.crit_dmg_.add(
      cmpGE(
        lcCount,
        1,
        shieldProvided.ifOn(subscript(superimpose, dm.crit_dmg_))
      )
    ),
    cmpGE(lcCount, 1, 'infer', '')
  ),
  registerBuff(
    'common_dmg_',
    teamBuff.premod.common_dmg_.add(
      cmpGE(
        lcCount,
        1,
        followUpHit.ifOn(subscript(superimpose, dm.common_dmg_))
      )
    ),
    cmpGE(lcCount, 1, 'unique', '')
  )
)
export default sheet
