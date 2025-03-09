import { cmpGE, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { own, ownBuff, registerBuff, registerBuffFormula } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'SailingTowardsASecondLife'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  registerBuff(
    'break_defIgn_',
    ownBuff.premod.defIgn_.addWithDmgType(
      'break',
      cmpGE(lcCount, 1, subscript(superimpose, dm.break_defIgn_))
    ),
    cmpGE(lcCount, 1, 'unique', '')
  ),

  // Conditional buffs
  registerBuffFormula(
    'spd_',
    ownBuff.premod.spd_.add(
      cmpGE(
        lcCount,
        1,
        cmpGE(
          own.final.brEffect_,
          dm.brEffect_threshold,
          subscript(superimpose, dm.spd_)
        )
      )
    ),
    cmpGE(lcCount, 1, 'unique', '')
  )
)
export default sheet
