import { cmpGE, prod } from '@genshin-optimizer/pando'
import { type CharacterKey } from '@genshin-optimizer/sr-consts'
import { allStats } from '@genshin-optimizer/sr-stats'
import type { DmgTag } from '../util'
import {
  allBoolConditionals,
  customDmg,
  percent,
  register,
  self,
  selfBuff,
} from '../util'
import { dmg, entriesForChar, getBaseTag, scalingParams } from './util'

const key: CharacterKey = 'Serval'
const data_gen = allStats.char[key]
const baseTag = getBaseTag(data_gen)
const shockTag: DmgTag = { ...baseTag, damageType1: 'dot' }
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
    dmgPrimary: skill[s++],
    dmgBlast: skill[s++],
    shockChance: skill[s++][0],
    shockDuration: skill[s++][0],
    shockDmg: skill[s++],
  },
  ult: {
    dmg: ult[u++],
    shockDurationInc: ult[u++][0],
  },
  talent: {
    dmg: talent[ta++],
  },
  technique: {
    shockChance: technique[te++][0],
    dmg: technique[te++][0],
    shockDuration: technique[te++][0],
    shockDmg: technique[te++][0],
  },
  e1: {
    dmg: eidolon[1][0],
  },
  e2: {
    energyRegen: eidolon[2][0],
  },
  e4: {
    shockChance: eidolon[4][0],
  },
  e6: {
    dmg_: eidolon[6][0],
  },
} as const

const { char } = self

const { c6Shocked } = allBoolConditionals(key)

const sheet = register(
  key,
  // Handles base stats, StatBoosts and Eidolon 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...dmg('basicDmg', baseTag, 'atk', dm.basic.dmg, 'basic'),
  ...dmg('skillDmgPrimary', baseTag, 'atk', dm.skill.dmgPrimary, 'skill'),
  ...dmg('skillDmgBlast', baseTag, 'atk', dm.skill.dmgBlast, 'skill'),
  ...dmg('skillShockDmg', shockTag, 'atk', dm.skill.shockDmg, 'skill'),
  ...dmg('ultDmg', baseTag, 'atk', dm.ult.dmg, 'ult'),
  ...dmg(
    'talentDmg',
    { damageType1: 'elemental', ...baseTag },
    'atk',
    dm.talent.dmg,
    'talent'
  ),
  ...customDmg(
    'techniqueDmg',
    { damageType1: 'technique', ...baseTag },
    prod(self.final.atk, percent(dm.technique.dmg))
  ),
  ...customDmg(
    'techniqueShockDmg',
    shockTag,
    prod(self.final.atk, percent(dm.technique.shockDmg))
  ),
  // Eidolon formulas
  ...customDmg(
    'e1Dmg',
    { damageType1: 'elemental', ...baseTag },
    prod(self.final.atk, percent(dm.e1.dmg)),
    undefined,
    { cond: cmpGE(char.eidolon, 1, 'unique', '') }
  ),

  // Eidolon buffs
  selfBuff.premod.dmg_.add(cmpGE(char.eidolon, 6, c6Shocked.ifOn(dm.e6.dmg_)))
)
export default sheet
