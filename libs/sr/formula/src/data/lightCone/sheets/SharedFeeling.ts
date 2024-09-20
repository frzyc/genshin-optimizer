import { subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  enemyDebuff,
  own,
  ownBuff,
  register,
  registerBuff,
  teamBuff,
} from '../../util'
import { entriesForLightCone } from '../util'

const key: LightConeKey = 'SharedFeeling'
const data_gen = allStats.lightCone[key]
const dm = mappedStats.lightCone[key]

const { superimpose } = own.lightCone

// TODO: Add conditionals
const { boolConditional } = allBoolConditionals(key)
const { listConditional } = allListConditionals(key, ['val1', 'val2'])
const { numConditional } = allNumConditionals(key, true, 0, 2)

const sheet = register(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(data_gen),

  // TODO: Add formulas/buffs
  // Conditional buffs
  registerBuff(
    'cond_dmg_',
    ownBuff.premod.dmg_.add(
      boolConditional.ifOn(subscript(superimpose, dm.cond_dmg_))
    )
  ),
  registerBuff(
    'team_dmg_',
    teamBuff.premod.dmg_.add(listConditional.map({ val1: 1, val2: 2 }))
  ),
  registerBuff('enemy_defIgn_', enemyDebuff.common.defIgn_.add(numConditional))
)
export default sheet
