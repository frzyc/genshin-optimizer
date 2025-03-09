import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { customDmg, own } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'ThisIsMe'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  // TODO: add dmg formula
  ...customDmg(
    'ult_dmg_',
    { damageType1: 'ult' },
    cmpGE(
      lcCount,
      1,
      prod(own.final.def, subscript(superimpose, dm.ult_dmg_scaling))
    ),
    [1],
    { cond: cmpGE(lcCount, 1, 'unique', '') }
  )
)
export default sheet
