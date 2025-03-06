import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import {
  allBoolConditionals,
  customHeal,
  own,
  ownBuff,
  registerBuff,
} from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'SomethingIrreplaceable'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { wearerHit } = allBoolConditionals(key)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  customHeal(
    'healing',
    cmpGE(
      lcCount,
      1,
      prod(own.final.atk, subscript(superimpose, dm.healingScaling))
    ),
    { cond: cmpGE(lcCount, 1, 'unique', '') }
  ),

  // Conditional buffs
  registerBuff(
    'common_dmg_',
    ownBuff.premod.common_dmg_.add(
      cmpGE(lcCount, 1, wearerHit.ifOn(subscript(superimpose, dm.common_dmg_)))
    ),
    cmpGE(lcCount, 1, 'unique', '')
  )
)
export default sheet
