import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import {
  allNumConditionals,
  own,
  ownBuff,
  registerBuff,
  teamBuff,
} from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'WorrisomeBlissful'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { tame } = allNumConditionals(key, true, 0, dm.stacks)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  registerBuff(
    'followUp_dmg_',
    ownBuff.premod.dmg_.addWithDmgType(
      'followUp',
      cmpGE(lcCount, 1, subscript(superimpose, dm.followUp_dmg_))
    ),
    cmpGE(lcCount, 1, 'infer', '')
  ),

  // Conditional buffs
  registerBuff(
    'crit_dmg_',
    teamBuff.premod.crit_dmg_.add(
      cmpGE(lcCount, 1, prod(tame, subscript(superimpose, dm.crit_dmg_)))
    ),
    cmpGE(lcCount, 1, 'infer', '')
  )
)
export default sheet
