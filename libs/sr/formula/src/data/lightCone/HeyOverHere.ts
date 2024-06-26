import { subscript } from '@genshin-optimizer/pando/engine'
import type { LightConeKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '@genshin-optimizer/sr/stats'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  enemyDebuff,
  register,
  self,
  selfBuff,
  teamBuff,
} from '../util'
import { entriesForLightCone } from './util'

const key: LightConeKey = 'HeyOverHere'
const data_gen = allStats.lightCone[key]

let i = 0
// TODO: Load scalings
const dm = {
  dmg: data_gen.superimpose.otherStats[i++] ?? [1, 2, 3, 4, 5],
}

const { superimpose } = self.lightCone

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
  selfBuff.premod.dmg_.add(
    boolConditional.ifOn(subscript(superimpose, dm.dmg))
  ),
  teamBuff.premod.dmg_.add(listConditional.map({ val1: 1, val2: 2 })),
  enemyDebuff.common.defIgn_.add(numConditional)
)
export default sheet
