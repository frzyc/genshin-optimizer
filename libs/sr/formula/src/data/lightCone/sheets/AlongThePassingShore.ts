import { cmpGE, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'AlongThePassingShore'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { enemyHit } = allBoolConditionals(key)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  // Conditional buffs
  registerBuff(
    'common_dmg_',
    ownBuff.premod.common_dmg_.add(
      cmpGE(lcCount, 1, enemyHit.ifOn(subscript(superimpose, dm.common_dmg_)))
    ),
    cmpGE(lcCount, 1, 'infer', '')
  ),
  registerBuff(
    'ult_dmg_',
    ownBuff.premod.dmg_.addWithDmgType(
      'ult',
      cmpGE(lcCount, 1, enemyHit.ifOn(subscript(superimpose, dm.ult_dmg_)))
    ),
    cmpGE(lcCount, 1, 'unique', '')
  )
)
export default sheet
