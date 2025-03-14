import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import {
  allNumConditionals,
  customHeal,
  own,
  percent,
  target,
} from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'WeAreWildfire'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

// 100 would be dead lol
const { hpDifference } = allNumConditionals(key, true, 0, 99)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  customHeal(
    'healing',
    cmpGE(
      lcCount,
      1,
      prod(
        subscript(superimpose, dm.healScaling),
        target.final.hp,
        percent(prod(0.01, hpDifference))
      )
    ),
    { team: true, isSemiOwn: true, cond: cmpGE(lcCount, 1, 'infer', '') }
  )
)
export default sheet
