import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allNumConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'IShallBeMyOwnSword'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { eclipse } = allNumConditionals(key, true, 0, dm.stacks)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  // Conditional buffs
  registerBuff(
    'common_dmg_',
    ownBuff.premod.common_dmg_.add(
      cmpGE(lcCount, 1, prod(eclipse, subscript(superimpose, dm.common_dmg_)))
    ),
    cmpGE(lcCount, 1, 'infer', '')
  ),
  registerBuff(
    'defIgn_',
    ownBuff.premod.defIgn_.add(
      cmpGE(
        lcCount,
        1,
        cmpGE(eclipse, dm.stacks, subscript(superimpose, dm.defIgn_))
      )
    ),
    cmpGE(lcCount, 1, 'infer', '')
  )
)
export default sheet
