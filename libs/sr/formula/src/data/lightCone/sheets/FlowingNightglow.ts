import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import {
  allBoolConditionals,
  allNumConditionals,
  own,
  ownBuff,
  registerBuff,
  teamBuff,
} from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'FlowingNightglow'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { cadenza } = allBoolConditionals(key)
const { cantillation } = allNumConditionals(key, true, 0, dm.stacks)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  // Conditional buffs
  registerBuff(
    'enerRegen_',
    ownBuff.premod.enerRegen_.add(
      cmpGE(
        lcCount,
        1,
        prod(cantillation, subscript(superimpose, dm.enerRegen_))
      )
    ),
    cmpGE(lcCount, 1, 'infer', '')
  ),
  registerBuff(
    'atk_',
    ownBuff.premod.atk_.add(
      cmpGE(lcCount, 1, cadenza.ifOn(subscript(superimpose, dm.atk_)))
    ),
    cmpGE(lcCount, 1, 'infer', '')
  ),
  registerBuff(
    'common_dmg_',
    teamBuff.premod.common_dmg_.add(
      cmpGE(lcCount, 1, cadenza.ifOn(subscript(superimpose, dm.common_dmg_)))
    ),
    cmpGE(lcCount, 1, 'infer', '')
  )
)
export default sheet
