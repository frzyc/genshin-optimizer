import { cmpGE, prod, subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import {
  allNumConditionals,
  customDmg,
  own,
  ownBuff,
  percent,
  registerBuff,
} from '../../util'
import { entriesForLightCone, registerLightCone } from '../util'

const key: LightConeKey = 'PatienceIsAllYouNeed'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]
const lcCount = own.common.count.sheet(key)
const { superimpose } = own.lightCone

const { attackCount } = allNumConditionals(key, true, 0, dm.stacks)

const sheet = registerLightCone(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(key, data_gen),

  ...customDmg(
    'erode',
    { damageType1: 'dot', elementalType: 'lightning' },
    cmpGE(
      lcCount,
      1,
      prod(own.final.atk, percent(subscript(superimpose, dm.erode))),
    ),
    [1],
    { cond: cmpGE(lcCount, 1, 'infer', '') },
  ),

  // Conditional buffs
  registerBuff(
    'spd_',
    ownBuff.premod.spd_.add(
      cmpGE(lcCount, 1, prod(attackCount, subscript(superimpose, dm.spd_))),
    ),
    cmpGE(lcCount, 1, 'infer', ''),
  ),
)
export default sheet
