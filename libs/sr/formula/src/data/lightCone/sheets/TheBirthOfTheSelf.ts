import { cmpGE, subscript, sum } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'TheBirthOfTheSelf'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { enemyHpLE50 } = allBoolConditionals(key)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  // Conditional buffs
  registerBuff(
    'followUp_dmg_',
    ownBuff.premod.dmg_.addWithDmgType(
      'followUp',
      cmpGE(
        lcCount,
        1,
        sum(
          subscript(superimpose, dm.followUp_dmg_),
          enemyHpLE50.ifOn(subscript(superimpose, dm.extra_followUp_dmg_))
        )
      )
    ),
    cmpGE(lcCount, 1, 'infer', '')
  )
)
export default sheet
