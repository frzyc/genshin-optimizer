import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allNumConditionals, own, registerBuff, teamBuff } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'LongRoadLeadsHome'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { charring } = allNumConditionals(key, true, 0, dm.stacks)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  // Conditional buffs
  registerBuff(
    'break_dmg_',
    teamBuff.premod.dmg_.addWithDmgType(
      'break',
      cmpGE(lcCount, 1, prod(charring, subscript(superimpose, dm.break_dmg_))),
    ),
    cmpGE(lcCount, 1, 'infer', ''),
  ),
)
export default sheet
