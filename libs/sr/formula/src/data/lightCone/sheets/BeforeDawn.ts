import { cmpGE, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allBoolConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'BeforeDawn'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { followUpTriggered } = allBoolConditionals(key)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  // Conditional buffs
  registerBuff(
    'skill_dmg_',
    ownBuff.premod.dmg_.addWithDmgType(
      'skill',
      cmpGE(lcCount, 1, subscript(superimpose, dm.skill_ult_dmg_))
    ),
    cmpGE(lcCount, 1, 'unique', '')
  ),
  registerBuff(
    'ult_dmg_',
    ownBuff.premod.dmg_.addWithDmgType(
      'ult',
      cmpGE(lcCount, 1, subscript(superimpose, dm.skill_ult_dmg_))
    ),
    cmpGE(lcCount, 1, 'unique', '')
  ),
  registerBuff(
    'followUp_dmg_',
    ownBuff.premod.dmg_.addWithDmgType(
      'followUp',
      cmpGE(
        lcCount,
        1,
        followUpTriggered.ifOn(subscript(superimpose, dm.followUp_dmg_))
      )
    ),
    cmpGE(lcCount, 1, 'unique', '')
  )
)
export default sheet
