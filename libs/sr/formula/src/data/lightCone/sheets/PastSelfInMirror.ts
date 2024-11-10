import { cmpGE, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import {
  allBoolConditionals,
  own,
  register,
  registerBuff,
  teamBuff,
} from '../../util'
import { entriesForLightCone } from '../util'

const key: LightConeKey = 'PastSelfInMirror'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { useUltimate } = allBoolConditionals(key)

const sheet = register(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  // Conditional buffs
  registerBuff(
    'cond_dmg_',
    teamBuff.premod.dmg_.add(
      cmpGE(lcCount, 1, useUltimate.ifOn(subscript(superimpose, dm.dmg_)))
    )
  )
)
export default sheet
