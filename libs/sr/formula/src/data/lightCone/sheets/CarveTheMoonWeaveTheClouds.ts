import { cmpEq, cmpGE, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allListConditionals, own, registerBuff, teamBuff } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'CarveTheMoonWeaveTheClouds'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { atk_crit_dmg_enerRegen_ } = allListConditionals(key, [
  'atk_',
  'crit_dmg_',
  'enerRegen_',
])

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  // Conditional buffs
  registerBuff(
    'atk_',
    teamBuff.premod.atk_.add(
      cmpGE(
        lcCount,
        1,
        cmpEq(atk_crit_dmg_enerRegen_.value, 1, subscript(superimpose, dm.atk_))
      )
    ),
    cmpGE(lcCount, 1, 'infer', '')
  ),
  registerBuff(
    'crit_dmg_',
    teamBuff.premod.crit_dmg_.add(
      cmpGE(
        lcCount,
        1,
        cmpEq(
          atk_crit_dmg_enerRegen_.value,
          2,
          subscript(superimpose, dm.crit_dmg_)
        )
      )
    ),
    cmpGE(lcCount, 1, 'infer', '')
  ),
  registerBuff(
    'enerRegen_',
    teamBuff.premod.enerRegen_.add(
      cmpGE(
        lcCount,
        1,
        cmpEq(
          atk_crit_dmg_enerRegen_.value,
          3,
          subscript(superimpose, dm.enerRegen_)
        )
      )
    ),
    cmpGE(lcCount, 1, 'infer', '')
  )
)
export default sheet
