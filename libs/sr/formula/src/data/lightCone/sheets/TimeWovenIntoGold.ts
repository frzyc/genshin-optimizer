import { cmpEq, cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allNumConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'TimeWovenIntoGold'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { brocade } = allNumConditionals(key, true, 0, dm.stacks)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  // Conditional buffs
  registerBuff(
    'crit_dmg_',
    ownBuff.premod.crit_dmg_.add(
      cmpGE(lcCount, 1, prod(brocade, subscript(superimpose, dm.crit_dmg_)))
    ),
    cmpGE(lcCount, 1, 'infer', '')
  ),
  registerBuff(
    'basic_dmg_',
    ownBuff.premod.dmg_.addWithDmgType(
      'basic',
      cmpGE(
        lcCount,
        1,
        cmpEq(
          brocade,
          dm.stacks,
          prod(brocade, subscript(superimpose, dm.basic_dmg_))
        )
      )
    ),
    cmpGE(lcCount, 1, 'infer', '')
  )
  // TODO: add memosprite
)
export default sheet
