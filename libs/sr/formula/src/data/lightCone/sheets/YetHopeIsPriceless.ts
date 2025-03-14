import {
  cmpGE,
  max,
  min,
  prod,
  subscript,
  sum,
} from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { floor } from '../../../util'
import {
  allBoolConditionals,
  own,
  ownBuff,
  registerBuff,
  registerBuffFormula,
} from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'YetHopeIsPriceless'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { battleStartOrBasicUsed } = allBoolConditionals(key)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  // Conditional buffs
  registerBuffFormula(
    'followUp_dmg_',
    ownBuff.premod.dmg_.addWithDmgType(
      'followUp',
      cmpGE(
        lcCount,
        1,
        prod(
          min(
            dm.stacks,
            floor(
              prod(
                max(0, sum(own.final.crit_dmg_, -dm.crit_dmg_threshold)),
                1 / dm.step
              )
            )
          ),
          subscript(superimpose, dm.followUp_dmg_)
        )
      )
    ),
    cmpGE(lcCount, 1, 'infer', '')
  ),
  registerBuff(
    'ult_defIgn_',
    ownBuff.premod.defIgn_.addWithDmgType(
      'ult',
      cmpGE(
        lcCount,
        1,
        battleStartOrBasicUsed.ifOn(
          subscript(superimpose, dm.ult_followUp_defIgn_)
        )
      )
    ),
    cmpGE(lcCount, 1, 'infer', '')
  ),
  registerBuff(
    'followUp_defIgn_',
    ownBuff.premod.defIgn_.addWithDmgType(
      'followUp',
      cmpGE(
        lcCount,
        1,
        battleStartOrBasicUsed.ifOn(
          subscript(superimpose, dm.ult_followUp_defIgn_)
        )
      )
    ),
    cmpGE(lcCount, 1, 'unique', '')
  )
)
export default sheet
