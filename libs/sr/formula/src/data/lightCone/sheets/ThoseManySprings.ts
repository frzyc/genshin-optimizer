import { cmpGE, subscript, sum } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import { allBoolConditionals, own, registerBuff, teamBuff } from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'ThoseManySprings'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { unarmored, cornered } = allBoolConditionals(key)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  // Conditional buffs
  registerBuff(
    'common_dmg_',
    teamBuff.premod.common_dmg_.add(
      cmpGE(
        lcCount,
        1,
        unarmored.ifOn(
          sum(
            subscript(superimpose, dm.common_dmg_),
            cornered.ifOn(subscript(superimpose, dm.extra_common_dmg_)),
          ),
        ),
      ),
    ),
    cmpGE(lcCount, 1, 'infer', ''),
  ),
)
export default sheet
