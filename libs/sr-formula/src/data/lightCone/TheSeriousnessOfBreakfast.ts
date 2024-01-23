import { prod, subscript } from '@genshin-optimizer/pando'
import type { LightConeKey } from '@genshin-optimizer/sr-consts'
import { allStats } from '@genshin-optimizer/sr-stats'
import { allNumConditionals, register, self, selfBuff } from '../util'
import { entriesForLightCone } from './util'

const key: LightConeKey = 'TheSeriousnessOfBreakfast'
const data_gen = allStats.lightCone[key]

const dm = {
  passiveDmg: data_gen.superimpose.otherStats[0],
  atk_: data_gen.superimpose.otherStats[1],
  numStacks: data_gen.superimpose.otherStats[2][0],
}

const { superimpose } = self.lightCone

const { stackCount } = allNumConditionals(key, 'sum', true, 0, dm.numStacks)

const sheet = register(
  key,
  // Handles base stats and passive buffs
  entriesForLightCone(data_gen),

  // Conditional buffs
  selfBuff.premod.atk_.add(prod(subscript(superimpose, dm.atk_), stackCount))
)
export default sheet
