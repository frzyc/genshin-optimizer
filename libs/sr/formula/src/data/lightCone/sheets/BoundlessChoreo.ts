import { cmpGE, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'BoundlessChoreo'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { enemySlowedOrRedDef } = allBoolConditionals(key)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  // Conditional buffs
  registerBuff(
    'crit_dmg_',
    ownBuff.premod.crit_dmg_.add(
      cmpGE(
        lcCount,
        1,
        enemySlowedOrRedDef.ifOn(subscript(superimpose, dm.crit_dmg_))
      )
    ),
    cmpGE(lcCount, 1, 'infer', '')
  )
)
export default sheet
