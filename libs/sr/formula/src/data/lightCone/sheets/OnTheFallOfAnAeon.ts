import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import {
  allBoolConditionals,
  allNumConditionals,
  own,
  ownBuff,
  registerBuff,
} from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'OnTheFallOfAnAeon'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { enemyBroken } = allBoolConditionals(key)
const { wearerAttacked } = allNumConditionals(key, true, 0, dm.stacks)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  // Conditional buffs
  registerBuff(
    'atk_',
    ownBuff.premod.atk_.add(
      cmpGE(lcCount, 1, prod(wearerAttacked, subscript(superimpose, dm.atk_)))
    ),
    cmpGE(lcCount, 1, 'unique', '')
  ),
  registerBuff(
    'common_dmg_',
    ownBuff.premod.common_dmg_.add(
      cmpGE(
        lcCount,
        1,
        enemyBroken.ifOn(subscript(superimpose, dm.common_dmg_))
      )
    ),
    cmpGE(lcCount, 1, 'unique', '')
  )
)
export default sheet
