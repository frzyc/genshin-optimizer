import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allNumConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'IVentureForthToHunt'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { luminflux } = allNumConditionals(key, true, 0, 2)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  // Conditional buffs
  registerBuff(
    'ult_defIgn_',
    ownBuff.premod.defIgn_.addWithDmgType(
      'ult',
      cmpGE(lcCount, 1, prod(luminflux, subscript(superimpose, dm.ult_defIgn_)))
    ),
    cmpGE(lcCount, 1, 'unique', '')
  )
)
export default sheet
