import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { customShield, own, percent } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'TextureOfMemories'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  customShield(
    'shield',
    cmpGE(
      lcCount,
      1,
      prod(percent(subscript(superimpose, dm.shieldScaling)), own.final.hp)
    ),
    { cond: cmpGE(lcCount, 1, 'infer', '') }
  )
)
export default sheet
