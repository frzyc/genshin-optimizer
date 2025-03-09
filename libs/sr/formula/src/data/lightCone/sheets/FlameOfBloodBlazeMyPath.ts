import { cmpGE, prod, subscript, sum } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import {
  allBoolConditionals,
  own,
  ownBuff,
  percent,
  registerBuff,
  registerBuffFormula,
} from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'FlameOfBloodBlazeMyPath'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { ultUsed, skillUsed, hpConsumedMoreThan500 } = allBoolConditionals(key)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  registerBuffFormula(
    'hp_loss',
    ownBuff.formula.base.add(
      cmpGE(
        lcCount,
        1,
        prod(own.final.hp, percent(subscript(superimpose, dm.consumedHp_)))
      )
    ),
    cmpGE(lcCount, 1, 'unique', '')
  ),

  // Conditional buffs
  registerBuff(
    'skill_dmg_',
    ownBuff.premod.dmg_.addWithDmgType(
      'skill',
      cmpGE(
        lcCount,
        1,
        skillUsed.ifOn(
          sum(
            subscript(superimpose, dm.skill_ult_dmg_),
            hpConsumedMoreThan500.ifOn(
              subscript(superimpose, dm.bonus_skill_ult_dmg_)
            )
          )
        )
      )
    ),
    cmpGE(lcCount, 1, 'unique', '')
  ),
  registerBuff(
    'ult_dmg_',
    ownBuff.premod.dmg_.addWithDmgType(
      'ult',
      cmpGE(
        lcCount,
        1,
        ultUsed.ifOn(
          sum(
            subscript(superimpose, dm.skill_ult_dmg_),
            hpConsumedMoreThan500.ifOn(
              subscript(superimpose, dm.bonus_skill_ult_dmg_)
            )
          )
        )
      )
    ),
    cmpGE(lcCount, 1, 'unique', '')
  )
)
export default sheet
