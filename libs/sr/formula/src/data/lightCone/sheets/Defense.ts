import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { customHeal, own, percent } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'Defense'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  customHeal(
    'healing',
    cmpGE(
      lcCount,
      1,
      prod(own.final.hp, percent(subscript(superimpose, dm.healAmountByHp)))
    ),
    { cond: cmpGE(lcCount, 1, 'infer', '') }
  )
)
export default sheet
