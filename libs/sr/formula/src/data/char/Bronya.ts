import { cmpGE } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/sr/consts'
import { allStats } from '@genshin-optimizer/sr/stats'
import {
  allBoolConditionals,
  allListConditionals,
  allNumConditionals,
  enemyDebuff,
  own,
  ownBuff,
  register,
  teamBuff,
} from '../util'
import { dmg, entriesForChar, getBaseTag, scalingParams } from './util'

const key: CharacterKey = 'Bronya'
const data_gen = allStats.char[key]
const baseTag = getBaseTag(data_gen)
const { basic, skill, ult, talent, technique, eidolon } =
  scalingParams(data_gen)

let s = 0,
  u = 0,
  ta = 0,
  te = 0
// TODO: Load scalings
const dm = {
  basic: {
    dmg: basic[0][0],
  },
  skill: {
    dmg: skill[0][s++],
  },
  ult: {
    dmg: ult[0][u++],
  },
  talent: {
    dmg: talent[0][ta++],
  },
  technique: {
    dmg: (technique[0][te++] ?? [0])[0],
  },
  e1: {
    dmg: eidolon[1][0] ?? 0,
  },
} as const

const { char } = own

// TODO: Add conditionals
const { boolConditional } = allBoolConditionals(key)
const { listConditional } = allListConditionals(key, ['val1', 'val2'])
const { numConditional } = allNumConditionals(key, true, 0, 2)

const sheet = register(
  key,
  // Handles base stats, StatBoosts and Eidolon 3 + 5
  entriesForChar(data_gen),

  // TODO: Add formulas/buffs
  // Formulas
  ...dmg('basicDmg', baseTag, 'atk', dm.basic.dmg, 'basic'),

  // Buffs
  ownBuff.premod.dmg_.add(cmpGE(char.eidolon, 6, boolConditional.ifOn(1))),
  teamBuff.premod.dmg_.add(listConditional.map({ val1: 1, val2: 2 })),
  enemyDebuff.common.defIgn_.add(numConditional)
)
export default sheet
