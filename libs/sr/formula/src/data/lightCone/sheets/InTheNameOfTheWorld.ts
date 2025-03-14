import { cmpGE, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'InTheNameOfTheWorld'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { enemyDebuffed } = allBoolConditionals(key)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  registerBuff(
    'eff_',
    ownBuff.premod.eff_.addWithDmgType(
      'skill',
      cmpGE(lcCount, 1, subscript(superimpose, dm.eff_))
    ),
    cmpGE(lcCount, 1, 'infer', '')
  ),
  registerBuff(
    'atk_',
    ownBuff.premod.atk_.addWithDmgType(
      'skill',
      cmpGE(lcCount, 1, subscript(superimpose, dm.atk_))
    ),
    cmpGE(lcCount, 1, 'infer', '')
  ),

  // Conditional buffs
  registerBuff(
    'common_dmg_',
    ownBuff.premod.common_dmg_.add(
      cmpGE(
        lcCount,
        1,
        enemyDebuffed.ifOn(subscript(superimpose, dm.common_dmg_))
      )
    ),
    cmpGE(lcCount, 1, 'infer', '')
  )
)
export default sheet
