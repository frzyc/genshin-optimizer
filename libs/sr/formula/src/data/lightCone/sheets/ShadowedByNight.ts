import { cmpGE, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'ShadowedByNight'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { enterBattleOrBreakDmg } = allBoolConditionals(key)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  // Conditional buffs
  registerBuff(
    'spd_',
    ownBuff.premod.spd_.add(
      cmpGE(
        lcCount,
        1,
        enterBattleOrBreakDmg.ifOn(subscript(superimpose, dm.spd_))
      )
    ),
    cmpGE(lcCount, 1, 'infer', '')
  )
)
export default sheet
