import { cmpGE, min, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { own, ownBuff, registerBuffFormula } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'PerfectTiming'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  registerBuffFormula(
    'heal_',
    ownBuff.premod.heal_.add(
      cmpGE(
        lcCount,
        1,
        min(
          subscript(superimpose, dm.max_heal_),
          prod(own.final.eff_res_, subscript(superimpose, dm.heal_scaling))
        )
      )
    ),
    cmpGE(lcCount, 1, 'infer', '')
  )
)
export default sheet
