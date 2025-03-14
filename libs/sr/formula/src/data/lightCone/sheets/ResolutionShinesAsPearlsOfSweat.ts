import { cmpGE, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allBoolConditionals, enemyDebuff, own, registerBuff } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'ResolutionShinesAsPearlsOfSweat'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { ensnared } = allBoolConditionals(key)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  // Conditional buffs
  registerBuff(
    'defRed_',
    enemyDebuff.common.defRed_.add(
      cmpGE(lcCount, 1, ensnared.ifOn(subscript(superimpose, dm.defRed_)))
    ),
    cmpGE(lcCount, 1, 'infer', '')
  )
)
export default sheet
