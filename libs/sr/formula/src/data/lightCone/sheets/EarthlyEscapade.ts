import { cmpGE, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allBoolConditionals, notOwnBuff, own, registerBuff } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'EarthlyEscapade'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { mask } = allBoolConditionals(key)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  // Conditional buffs
  registerBuff(
    'crit_',
    notOwnBuff.premod.crit_.add(
      cmpGE(lcCount, 1, mask.ifOn(subscript(superimpose, dm.crit_)))
    ),
    cmpGE(lcCount, 1, 'infer', '')
  ),
  registerBuff(
    'crit_dmg_',
    notOwnBuff.premod.crit_dmg_.add(
      cmpGE(lcCount, 1, mask.ifOn(subscript(superimpose, dm.crit_dmg_)))
    ),
    cmpGE(lcCount, 1, 'unique', '')
  )
)
export default sheet
