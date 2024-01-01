import { cmpGE, prod, sum } from '@genshin-optimizer/pando'
import { type CharacterKey } from '@genshin-optimizer/sr-consts'
import { allStats } from '@genshin-optimizer/sr-stats'
import {
  customDmg,
  customHeal,
  customShield,
  percent,
  register,
  self,
  target,
} from '../util'
import { dmg, entriesForChar, scalingParams, shield } from './util'

const key: CharacterKey = 'March7th'
const data_gen = allStats.char[key]
const { damageType: type } = data_gen
const { basic, skill, ult, talent, technique, eidolon } =
  scalingParams(data_gen)

let s = 0,
  u = 0,
  ta = 0,
  te = 0
const dm = {
  basic: {
    dmg: basic[0],
  },
  skill: {
    shieldMult: skill[s++],
    shieldDuration: skill[s++][0],
    allyHpThreshold: skill[s++][0],
    shieldBase: skill[s++],
    idk5: skill[s++][0],
  },
  ult: {
    dmg: ult[u++],
    freezeChance: ult[u++][0],
    freezeDuration: ult[u++][0],
    freezeDmg: ult[u++],
  },
  talent: {
    dmg: talent[ta++],
    triggers: talent[ta++][0],
  },
  technique: {
    freezeChance: technique[te++][0],
    freezeDuration: technique[te++][0],
    dmg: technique[te++][0],
  },
  e2: {
    shieldMult: eidolon[2][0],
    duration: eidolon[2][1],
    shieldBase: eidolon[2][2],
  },
  e4: {
    dmgInc: eidolon[4][0],
  },
  e6: {
    healMult: eidolon[6][0],
    healBase: eidolon[6][1],
  },
} as const

const { final: _final, char } = self

const e4_counter_dmgInc = cmpGE(
  char.eidolon,
  4,
  prod(self.final.def, percent(dm.e4.dmgInc))
)

const sheet = register(
  key,
  // Handles base stats, StatBoosts and Eidolon 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...dmg('basicDmg', type, 'atk', dm.basic.dmg, 'basic'),
  shield(
    'skillShield',
    'def',
    dm.skill.shieldMult,
    dm.skill.shieldBase,
    'skill'
  ),
  ...dmg('ultDmg', type, 'atk', dm.ult.dmg, 'ult', [0.25, 0.25, 0.25, 0.25]),
  ...dmg('ultFreeze', type, 'atk', dm.ult.freezeDmg, 'ult', undefined, 'dot'),
  ...dmg(
    'talentDmg',
    type,
    'atk',
    dm.talent.dmg,
    'talent',
    undefined,
    'followup',
    undefined,
    self.formula.base.add(e4_counter_dmgInc)
  ),
  ...customDmg(
    'techniqueFreeze',
    type,
    'dot',
    prod(self.final.atk, percent(dm.technique.dmg))
  ),
  // Eidolon formulas
  customShield(
    'e1Shield',
    sum(prod(self.final.def, dm.e2.shieldMult), dm.e2.shieldBase),
    { cond: cmpGE(char.eidolon, 1, 'unique', '') }
  ),
  customHeal(
    'e6Heal',
    sum(prod(target.final.hp, dm.e6.healMult), dm.e6.healBase),
    { cond: cmpGE(char.eidolon, 6, 'unique', '') }
  )
)
export default sheet
