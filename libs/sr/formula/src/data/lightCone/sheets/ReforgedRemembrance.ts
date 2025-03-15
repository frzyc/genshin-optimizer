import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allNumConditionals, own, ownBuff, registerBuff } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'ReforgedRemembrance'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { prophet } = allNumConditionals(key, true, 0, dm.stacks)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  // Conditional buffs
  registerBuff(
    'atk_',
    ownBuff.premod.atk_.add(
      cmpGE(lcCount, 1, prod(prophet, subscript(superimpose, dm.atk_))),
    ),
    cmpGE(lcCount, 1, 'infer', ''),
  ),
  registerBuff(
    'dot_defIgn_',
    ownBuff.premod.defIgn_.addWithDmgType(
      'dot',
      cmpGE(lcCount, 1, prod(prophet, subscript(superimpose, dm.dot_defIgn_))),
    ),
    cmpGE(lcCount, 1, 'infer', ''),
  ),
)
export default sheet
