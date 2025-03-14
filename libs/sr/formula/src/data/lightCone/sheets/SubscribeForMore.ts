import { cmpGE, subscript, sum } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'SubscribeForMore'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { maxEnergy } = allBoolConditionals(key)

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
        sum(
          subscript(superimpose, dm.basic_skill_dmg_),
          maxEnergy.ifOn(subscript(superimpose, dm.extra_basic_skill_dmg_))
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
        sum(
          subscript(superimpose, dm.basic_skill_dmg_),
          maxEnergy.ifOn(subscript(superimpose, dm.extra_basic_skill_dmg_))
        )
      )
    ),
    cmpGE(lcCount, 1, 'unique', '')
  )
)
export default sheet
