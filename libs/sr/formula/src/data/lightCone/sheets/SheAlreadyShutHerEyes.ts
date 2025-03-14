import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import {
  allBoolConditionals,
  customHeal,
  own,
  percent,
  registerBuff,
  target,
  teamBuff,
} from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'SheAlreadyShutHerEyes'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { wearerHpReduced } = allBoolConditionals(key)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  customHeal(
    'maxHeal',
    cmpGE(
      lcCount,
      1,
      prod(percent(subscript(superimpose, dm.healScaling)), target.final.hp)
    ),
    { team: true, isSemiOwn: true, cond: cmpGE(lcCount, 1, 'infer', '') }
  ),

  // Conditional buffs
  registerBuff(
    'common_dmg_',
    teamBuff.premod.common_dmg_.add(
      cmpGE(
        lcCount,
        1,
        wearerHpReduced.ifOn(subscript(superimpose, dm.common_dmg_))
      )
    ),
    cmpGE(lcCount, 1, 'infer', '')
  )
)
export default sheet
