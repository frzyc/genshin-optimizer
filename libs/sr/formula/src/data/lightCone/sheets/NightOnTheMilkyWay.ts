import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import {
  allBoolConditionals,
  allNumConditionals,
  own,
  ownBuff,
  registerBuff,
} from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'NightOnTheMilkyWay'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { enemyBroken } = allBoolConditionals(key)
// Stacks not defined in datamine
const { enemiesOnField } = allNumConditionals(key, true, 0, 5)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  // Conditional buffs
  registerBuff(
    'atk_',
    ownBuff.premod.atk_.add(
      cmpGE(lcCount, 1, prod(enemiesOnField, subscript(superimpose, dm.atk_))),
    ),
    cmpGE(lcCount, 1, 'infer', ''),
  ),
  registerBuff(
    'common_dmg_',
    ownBuff.premod.common_dmg_.add(
      cmpGE(
        lcCount,
        1,
        enemyBroken.ifOn(subscript(superimpose, dm.common_dmg_)),
      ),
    ),
    cmpGE(lcCount, 1, 'infer', ''),
  ),
)
export default sheet
