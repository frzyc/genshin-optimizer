import { cmpGE, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allBoolConditionals, notOwnBuff, own, registerBuff } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'PastAndFuture'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { skillUsed } = allBoolConditionals(key)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  // Conditional buffs
  registerBuff(
    'common_dmg_',
    notOwnBuff.premod.common_dmg_.add(
      cmpGE(lcCount, 1, skillUsed.ifOn(subscript(superimpose, dm.common_dmg_)))
    ),
    cmpGE(lcCount, 1, 'unique', '')
  )
)
export default sheet
