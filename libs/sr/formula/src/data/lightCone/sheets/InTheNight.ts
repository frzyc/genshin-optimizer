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
import { own, ownBuff, registerBuff } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'InTheNight'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  // Conditional buffs
  registerBuff(
    'basic_dmg_',
    ownBuff.premod.dmg_.addWithDmgType(
      'basic',
      cmpGE(
        lcCount,
        1,
        prod(
          min(
            dm.stacks,
            floor(prod(max(0, sum(own.final.spd, -100)), 1 / dm.spdStep))
          ),
          subscript(superimpose, dm.basic_skill_dmg_)
        )
      )
    ),
    cmpGE(lcCount, 1, 'infer', '')
  ),
  registerBuff(
    'skill_dmg_',
    ownBuff.premod.dmg_.addWithDmgType(
      'skill',
      cmpGE(
        lcCount,
        1,
        prod(
          min(
            dm.stacks,
            floor(prod(max(0, sum(own.final.spd, -100)), 1 / dm.spdStep))
          ),
          subscript(superimpose, dm.basic_skill_dmg_)
        )
      )
    ),
    cmpGE(lcCount, 1, 'infer', '')
  ),
  registerBuff(
    'ult_crit_dmg_',
    ownBuff.premod.crit_dmg_.addWithDmgType(
      'ult',
      cmpGE(
        lcCount,
        1,
        prod(
          min(
            dm.stacks,
            floor(prod(max(0, sum(own.final.spd, -100)), 1 / dm.spdStep))
          ),
          subscript(superimpose, dm.ult_crit_dmg_)
        )
      )
    ),
    cmpGE(lcCount, 1, 'infer', '')
  )
)
export default sheet
