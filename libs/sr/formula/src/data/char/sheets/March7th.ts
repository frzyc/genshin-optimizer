import { cmpGE, prod, sum } from '@genshin-optimizer/pando/engine'
import { type CharacterKey } from '@genshin-optimizer/sr/consts'
import { allStats, mappedStats } from '@genshin-optimizer/sr/stats'
import {
  customDmg,
  customHeal,
  customShield,
  own,
  ownBuff,
  percent,
  register,
  target,
} from '../../util'
import { dmg, entriesForChar, getBaseTag, shield } from '../util'

const key: CharacterKey = 'March7th'
const data_gen = allStats.char[key]
const dm = mappedStats.char[key]
const baseTag = getBaseTag(data_gen)

const { char } = own

const e4_counter_dmgInc = cmpGE(
  char.eidolon,
  4,
  prod(own.final.def, percent(dm.e4.dmgInc)),
)

const sheet = register(
  key,
  // Handles base stats, StatBoosts and Eidolon 3 + 5
  entriesForChar(data_gen),

  // Formulas
  ...dmg('basicDmg', baseTag, 'atk', dm.basic.dmg, 'basic'),
  shield(
    'skillShield',
    'def',
    dm.skill.shieldMult,
    dm.skill.shieldBase,
    'skill',
  ),
  ...dmg('ultDmg', baseTag, 'atk', dm.ult.dmg, 'ult', [0.25, 0.25, 0.25, 0.25]),
  ...dmg(
    'ultFreeze',
    { damageType1: 'elemental', ...baseTag },
    'atk',
    dm.ult.freezeDmg,
    'ult',
    undefined,
  ),
  ...dmg(
    'talentDmg',
    { damageType1: 'followUp', ...baseTag },
    'atk',
    dm.talent.dmg,
    'talent',
    undefined,
    undefined,
    ownBuff.formula.base.add(e4_counter_dmgInc),
  ),
  ...customDmg(
    'techniqueFreeze',
    { damageType1: 'elemental', ...baseTag },
    prod(own.final.atk, percent(dm.technique.dmg)),
  ),
  // Eidolon formulas
  customShield(
    'e1Shield',
    sum(prod(own.final.def, dm.e2.shieldMult), dm.e2.shieldBase),
    { cond: cmpGE(char.eidolon, 1, 'infer', '') },
  ),
  customHeal(
    'e6Heal',
    sum(prod(target.final.hp, dm.e6.healMult), dm.e6.healBase),
    { cond: cmpGE(char.eidolon, 6, 'infer', '') },
  ),
)
export default sheet
