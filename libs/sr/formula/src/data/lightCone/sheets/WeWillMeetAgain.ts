import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { customDmg, own, percent } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'WeWillMeetAgain'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  ...customDmg(
    'additional_dmg',
    { damageType1: 'elemental' },
    cmpGE(
      lcCount,
      1,
      prod(own.final.atk, percent(subscript(superimpose, dm.dmg_scaling_)))
    ),
    [1],
    { cond: cmpGE(lcCount, 1, 'unique', '') }
  )
)
export default sheet
