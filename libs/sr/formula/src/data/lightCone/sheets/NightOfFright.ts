import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import {
  allNumConditionals,
  customHeal,
  own,
  registerBuff,
  target,
  teamBuff,
} from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'NightOfFright'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { healingProvided } = allNumConditionals(key, true, 0, dm.stacks)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  customHeal(
    'healing',
    cmpGE(
      lcCount,
      1,
      prod(subscript(superimpose, dm.healAmount), target.final.hp),
    ),
    { team: true, isSemiOwn: true, cond: cmpGE(lcCount, 1, 'infer', '') },
  ),

  // Conditional buffs
  registerBuff(
    'atk_',
    teamBuff.premod.atk_.add(
      cmpGE(lcCount, 1, prod(healingProvided, subscript(superimpose, dm.atk_))),
    ),
    cmpGE(lcCount, 1, 'infer', ''),
  ),
)
export default sheet
