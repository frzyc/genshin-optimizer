import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allNumConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'InTheNight'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

// TODO: change from conditional to calculation
const { spdExceeded } = allNumConditionals(key, true, 0, dm.stacks)

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
        prod(spdExceeded, subscript(superimpose, dm.basic_skill_dmg_))
      )
    ),
    cmpGE(lcCount, 1, 'unique', '')
  ),
  registerBuff(
    'skill_dmg_',
    ownBuff.premod.dmg_.addWithDmgType(
      'skill',
      cmpGE(
        lcCount,
        1,
        prod(spdExceeded, subscript(superimpose, dm.basic_skill_dmg_))
      )
    ),
    cmpGE(lcCount, 1, 'unique', '')
  ),
  registerBuff(
    'ult_crit_dmg_',
    ownBuff.premod.crit_dmg_.addWithDmgType(
      'ult',
      cmpGE(
        lcCount,
        1,
        prod(spdExceeded, subscript(superimpose, dm.ult_crit_dmg_))
      )
    ),
    cmpGE(lcCount, 1, 'unique', '')
  )
)
export default sheet
